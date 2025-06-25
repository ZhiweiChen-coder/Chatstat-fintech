/**
 * Examine a series of tweets and calculate market movement (either by ID or from tweets that have no existing movement analysis)
 *
 * @example Examine tweets showing output of each
 * ./run-agent platforms.twitter.movement.estimate -o river=61037b4064e97ed4563c8c46 -o platform=bitfinex -o symbol=BTCUSD -o dryRun -o verbose -o force
 * @example Adjustable filter for sentiment 
 * ./run-agent platforms.twitter.movement.estimate -o river=61037b4064e97ed4563c8c46 -o platform=bitfinex -o symbol=BTCUSD -o estTweetFilter="{ \"sentiment.affinPercent\": { \"\$gte\": 0.0 } }"
 */

const _ = require('lodash');
const moment = require('moment');

module.exports = {
	id: 'platforms.twitter.movement.estimate',
	timing: false,
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		if (_.isString(settings.limit)) settings.limit = parseInt(settings.limit);
		if (_.isString(settings.limitExisting)) settings.limitExisting = parseInt(settings.limitExisting);
		if (_.isString(settings.estTweetSample)) settings.estTweetSample = parseInt(settings.estTweetSample);
		if (_.isString(settings.requiredSamples)) settings.requiredSamples = parseInt(settings.requiredSamples);
		if (_.isString(settings.estTweetFilter)) settings.estTweetFilter = JSON.parse(settings.estTweetFilter);

		const config = _.defaults(settings, {
			river: undefined, // River to filter tweets by relevence
			platform: undefined, // Selected flow platform
			symbol: undefined, // Selected flow symbol
			id: undefined, // Specific tweets to examine as a CSV, used for debugging
			force: false, // Reexamine existing tweets that have already been analysed
			limit: 300, // Number of tweets to limit to when idle-processing, set to zero for infinite
			limitExisting: 500, // Avoid this number of existing data points - keep this under <1k for memeory reasons, duplicate calculations will be rejected anyway
			estTweetSample: 50, // Number of tweets before this one to sample to estimate movement, if number of retrieved tweets is less the calculation is marked as unfinished
			estTweetFilter: { // Filter to use when sampling tweets backwards in time
				'sentiment.affinPercent': {$gte: 0.25},
			},
			requiredSamples: 10,

			dryRun: false, // Don't actually create any movement data OR update the river backlog - just output debugging information
			verbose: false, // Return the analysis of each tweet when debugging
			verboseNed: false, // Be chatty even when there is Not Enough Data
		});

		if (!settings.river) {
			agent.warn('"river" setting must be specified');
			return Promise.reject('"river" setting must be specified');
		}

		if (!settings.platform || !settings.symbol) {
			agent.warn('"platform" and "symbol" settings must be specified');
			return Promise.reject('"platform" and "symbol" settings must be specified');
		}

		const flowQuery = {
			platform: settings.platform,
			symbol: settings.symbol,
		};

		const tweetMovementQuery = { // Query to run to fetch tweets to process
			...flowQuery, // Base query
			...(settings.id ? {platform_data: {$in: settings.id.split(/\s*,\s*/)}} : {}), // Limit to IDs if we have any
			...(settings.force ? {} : {$or: [ // Find non-completed data points
					{hour3EstimateCalculated: false},
					{hour3EstimateCalculated: {$exists: false}},
					{hour12EstimateCalculated: false},
					{hour12EstimateCalculated: {$exists: false}},
					{hour24EstimateCalculated: false},
					{hour24EstimateCalculated: {$exists: false}}
				]}
			),
		};
		let streamQuery = {}; // Prototype stream query per tweet (populated when we have the river)

		return Promise.resolve()
			// Retrieve river {{{
			.then(() => settings.river || Promise.reject(`No River ID specified`))
			.then(() => settings.platform || Promise.reject(`No Platform specified`))
			.then(() => settings.symbol || Promise.reject(`No Symbol specified`))
			.then(()=> app.db.rivers.findById(settings.river))
			.then(data => data || Promise.reject(`River not found "${settings.river}"`))
			.then(river => streamQuery = { // Restrict stream query by calculated river platforms
				platform: 'twitter',
				symbol: {
					$in: _(river.streams)
						.filter(f => f.platform == 'twitter')
						.map(f => f.symbol)
						.uniq()
						.value(),
				},
			})
			// }}}
			// Count matching tweet movements {{{
			.then(()=> app.db.platforms_data_movement.countDocuments(tweetMovementQuery))
			.then(totalTweets => {
				app.log('Going to process', totalTweets, 'Tweets');
				return totalTweets;
			})
			// }}}
			.then(totalTweets => {
				let tweetsProcessed = 0; // Document count that has been processed
				let tweetsProcessedComplete = 0; // Document count of tweets with all required information

				return db.platforms_data_movement.find(tweetMovementQuery)
					.populate('platform_data')
					.limit(settings.limitExisting > 0 ? +settings.limitExisting : 0)
					.sort('-date')
					.cursor()
					.eachAsync((doc, i) => {
						const tweet = doc.toObject().platform_data;
						// TODO: Perhaps show as percentage of `limitExisting` with `totalTweets` as part of message?
						if (settings.verbose)
							agent.log('Query', {
								date: {$lt: tweet.date},
								...streamQuery,
								...settings.estTweetFilter,
							});

						agent.progress('Examining tweets', ++tweetsProcessed, totalTweets);

						return Promise.resolve() // Fetch tweet history
							.then(()=> app.db.platforms_data
								.find({
									date: {$lt: tweet.date},
									...streamQuery,
									...settings.estTweetFilter,
								})
								.sort('-date')
								.limit(+settings.estTweetSample)
							)
							// Link tweet.movement
							.then(tweetHistory => Promise.all(tweetHistory.map(t => db.platforms_data_movement
								.findOne({
									...flowQuery, // Base query
									platform_data: t._id,
								})
								.then(m => {
									if (!t) return;
									var obj = t.toObject();
									if (m) obj.movement = m.toObject().values;
									return obj;
								}) // Glue .movement key to tweet}
							)))
							.then(tweetHistory => tweetHistory.filter(t => _.has(t, 'movement') && _.isObject(t.movement)))
							.then(tweetHistory => {
								if (tweetHistory.length < +settings.requiredSamples)
									return settings.verboseNed
										&& agent.log('* Tweet ',
											agent.log.colors.cyan(`#${tweet._id}`),
											agent.log.colors.gray(`(${moment(tweet.date).utc().format()})`),
											'-',
											agent.log.colors.yellow(`not enough data to estimate movement`)
										);

								Object.assign(doc.values, {
									// hour3 {{{
									hour3EstimateCalculated: tweetHistory
										.filter(t => t.movement.hour3ActualCalculated).length >= settings.estTweetSample,
									hour3Estimate: _.chain(tweetHistory)
										.filter(t => t.movement.hour3ActualCalculated)
										.meanBy(t => t.movement.hour3Actual)
										.value() || 0,
									hour3EstimatePercent: _.chain(tweetHistory)
										.filter(t => t.movement.hour3ActualCalculated)
										.meanBy(t => t.movement.hour3ActualPercent)
										.value() || 0,
									// }}}
									// hour12 {{{
									hour12EstimateCalculated: tweetHistory
										.filter(t => t.movement.hour12ActualCalculated).length >= settings.estTweetSample,
									hour12Estimate: _.chain(tweetHistory)
										.filter(t => t.movement.hour12ActualCalculated)
										.meanBy(t => t.movement.hour12Actual)
										.value() || 0,
									hour12EstimatePercent: _.chain(tweetHistory)
										.filter(t => t.movement.hour12ActualCalculated)
										.meanBy(t => t.movement.hour12ActualPercent)
										.value() || 0,
									// }}}
									// hour24 {{{
									hour24EstimateCalculated: tweetHistory
										.filter(t => t.movement.hour24ActualCalculated).length >= settings.estTweetSample,
									hour24Estimate: _.chain(tweetHistory)
										.filter(t => t.movement.hour24ActualCalculated)
										.meanBy(t => t.movement.hour24Actual)
										.value() || 0,
									hour24EstimatePercent: _.chain(tweetHistory)
										.filter(t => t.movement.hour24ActualCalculated)
										.meanBy(t => t.movement.hour24ActualPercent)
										.value() || 0,
									// }}}
								});

								if (settings.verbose)
									agent.log(
										'* Tweet ',
										agent.log.colors.cyan(`#${tweet._id}`),
										'~= 0h@', agent.log.colors.yellow(doc.values.hour0Actual),
										'3h∇', doc.values.hour3ActualCalculated ? agent.log.colors.yellow(doc.values.hour3Actual) : agent.log.colors.red('NED'),
										'3h~', ...(doc.values.hour3EstimateCalculated ? [agent.log.colors.yellow(doc.values.hour3Estimate), agent.log.colors.gray(`(${_.round(doc.values.hour3EstimatePercent * 100, 2)}%)`)] : [agent.log.colors.red('NED')]),
										'12h∇', doc.values.hour12ActualCalculated ? agent.log.colors.yellow(doc.values.hour12Actual) : agent.log.colors.red('NED'),
										'12h~', ...(doc.values.hour12EstimateCalculated ? [agent.log.colors.yellow(doc.values.hour12Estimate), agent.log.colors.gray(`(${_.round(doc.values.hour12EstimatePercent * 100, 2)}%)`)] : [agent.log.colors.red('NED')]),
										'24h∇', doc.values.hour24ActualCalculated ? agent.log.colors.yellow(doc.values.hour24Actual) : agent.log.colors.red('NED'),
										'24h~', ...(doc.values.hour24EstimateCalculated ? [agent.log.colors.yellow(doc.values.hour24Estimate), agent.log.colors.gray(`(${_.round(doc.values.hour24EstimatePercent * 100, 2)}%)`)] : [agent.log.colors.red('NED')]),
									);

								if (doc.values.hour0EstimateCalculated
									&& doc.values.hour3EstimateCalculated
									&& doc.values.hour12EstimateCalculated
									&& doc.values.hour24EstimateCalculated)
									tweetsProcessedComplete++;

								if (settings.dryRun) {
									agent.log('Update', doc.toObject());
								} else {
									// FIXME: doc.save() finishes before it's done? Cursor can be gone? `Cannot read property 'toArray' of undefined`
									// NOTE: Work-around, give the document a little 
									return new Promise((resolve, reject) => doc.save()
										.then(() => setTimeout(resolve, 50))
										.catch(e => reject(e))
									);
								}
							})
					})
					.then(()=> {
						agent.log('Processed', tweetsProcessed, 'tweets, of which', tweetsProcessedComplete, 'are data complete');
					})
			});
	},
};
