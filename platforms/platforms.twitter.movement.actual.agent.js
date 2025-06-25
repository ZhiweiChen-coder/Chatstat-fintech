/**
 * Attach actual market movement to a series of tweets (either by ID or from tweets in a river that have no existing movement analysis)
 *
 * @example Examine tweets showing output of each
 * ./run-agent platforms.twitter.movement.actual -o river=61037b4064e97ed4563c8c46 -o platform=bitfinex -o symbol=BTCUSD -o dryRun -o verbose -o force=true
 */

const _ = require('lodash');
const moment = require('moment');

module.exports = {
	id: 'platforms.twitter.movement.actual',
	timing: false,
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		if (_.isString(settings.limit)) settings.limit = parseInt(settings.limit);

		_.defaults(settings, {
			river: undefined, // River to filter tweets by relevence
			platform: undefined, // Selected flow platform
			symbol: undefined, // Selected flow symbol
			id: undefined, // Specific tweets to examine as a CSV, used for debugging
			force: false, // Reexamine existing tweets that have already been analysed
			limit: 300, // Number of tweets to limit to when idle-processing, set to zero for infinite
			seekRange: '6-hours', // Acceptable maximum range when looking for a corresponding market reading, should be slightly greater than the market tick interval

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

		settings.seekRange = settings.seekRange.split(/-/);

		const tweetQuery = { // Query to run to fetch tweets to process
			platform: 'twitter',
			...(settings.id ? {_id: {$in: settings.id.split(/\s*,\s*/)}} : {}), // Limit to IDs if we have any
		};
		let flowQuery = {}; // Prototype flow query per tweet (populated when we have the river)

		return Promise.resolve()
			// Retrieve river {{{
			.then(() => settings.river || Promise.reject(`No River ID specified`))
			.then(() => settings.platform || Promise.reject(`No Platform specified`))
			.then(() => settings.symbol || Promise.reject(`No Symbol specified`))
			.then(()=> app.db.rivers.findById(settings.river)
				.then(data => data || Promise.reject(`River not found "${settings.river}"`))
				.then(res => river = res)
			)
			.then(()=> tweetQuery.symbol = { // Restrict tweets by river streams
				$in: river.streams
					.filter(s => s.platform == 'twitter')
					.map(s => s.symbol)
			})
			// }}}
			// Restrict to a single flow {{{
			.then(()=> flowQuery = {
				platform: settings.platform,
				symbol: settings.symbol,
			})
			// }}}
			// Filter out completed movements (!force) {{{
			.then(()=> db.platforms_data_movement.find({
					...flowQuery, // Base query
					'values.hour0ActualCalculated': true,
					'values.hour3ActualCalculated': true,
					'values.hour12ActualCalculated': true,
					'values.hour24ActualCalculated': true,
				})
				.select('platform_data')
				.lean()
				.then(pds => {
					pds = pds.map(p => p.platform_data); // Splat into simple array of platforms_data pointers

					if (!settings.force && !settings.id) { // Not in force mode and no specific ID's specified - try to figure out which tweets are missing data
						agent.log('Filtering out', pds.length, 'existing data points');
						tweetQuery._id = {$nin: pds};
					} else if (settings.id) {
						agent.log('Ignoring', pds.length, 'existing data points - using only specified IDs and upserting over existing data');
					} else if (settings.force) {
						agent.log('Ignoring', pds.length, 'existing data points - upserting over existing data');
					}
				})
			)
			// }}}

			// Count matching tweets {{{
			.then(()=> app.db.platforms_data.countDocuments(tweetQuery))
			.then(totalTweets => {
				app.log('Going to process', totalTweets, 'Tweets');
				return totalTweets;
			})
			// }}}
			// Process matching tweets {{{
			.then(totalTweets => {
				let tweetsProcessed = 0; // Document count that has been processed
				let tweetsProcessedComplete = 0; // Document count of tweets with all required information

				return app.db.platforms_data.find(tweetQuery)
					.limit(settings.limit > 0 ? +settings.limit : 0)
					.sort('-date')
					.cursor()
					.eachAsync((tweet, i) => {
						// TODO: Perhaps show as percentage of `limit` with `totalTweets` as part of message?
						agent.progress('Examining tweets', ++tweetsProcessed, totalTweets);

						return Promise.all([
							// hour0Actual - Find at-market measure after tweet was made {{{
							app.db.platforms_data.findOne({
								...flowQuery, // Base query
								date: {
									$gte: moment(tweet.date).utc().toDate(),
									$lte: moment(tweet.date).utc().add(...settings.seekRange).toDate(),
								},
							}).sort('date'),
							// }}}

							// hour3Actual - Find first market measure at the 3 hour point after tweet was made {{{
							app.db.platforms_data.findOne({
								...flowQuery, // Base query
								date: {
									$gte: moment(tweet.date).utc().add(3, 'hours').toDate(),
									$lte: moment(tweet.date).utc().add(3, 'hours').add(...settings.seekRange).toDate(),
								},
							}).sort('date'),
							// }}}

							// hour12Actual - Find first market measure at the 12 hour point after tweet was made {{{
							app.db.platforms_data.findOne({
								...flowQuery, // Base query
								date: {
									$gte: moment(tweet.date).utc().add(12, 'hours').toDate(),
									$lte: moment(tweet.date).utc().add(12, 'hours').add(...settings.seekRange).toDate(),
								},
							}).sort('date'),
							// }}}

							// hour24Actual - Find first market measure at the 24 hour point after tweet was made {{{
							app.db.platforms_data.findOne({
								...flowQuery, // Base query
								date: {
									$gte: moment(tweet.date).utc().add(24, 'hours').toDate(),
									$lte: moment(tweet.date).utc().add(24, 'hours').add(...settings.seekRange).toDate(),
								},
							}).sort('date'),
							// }}}
						])
							.then(([marketHour0, marketHour3, marketHour12, marketHour24]) => {
								if (!marketHour0) return settings.verboseNed && agent.log('* Tweet ', agent.log.colors.cyan(`#${tweet._id}`), agent.log.colors.gray(`(${moment(tweet.date).utc().format()})`), '-', agent.log.colors.yellow(`not enough data to calculate movement`));

								const doc = {
									$set: {
										// hour0 {{{
										'values.hour0ActualCalculated': true,
										'values.hour0Actual': marketHour0.data.c,
										// }}}

										// hour3 {{{
										...(_.isObject(marketHour3) && marketHour0 && marketHour3.date > marketHour0.date ? {
											'values.hour3ActualCalculated': true,
											'values.hour3Actual': marketHour3.data.c - marketHour0.data.c,
											'values.hour3ActualPercent': (marketHour3.data.c - marketHour0.data.c) / marketHour0.data.c,
										} : {'values.hour3ActualCalculated': false}),
										// }}}

										// hour12 {{{
										...(_.isObject(marketHour12) && marketHour3 && marketHour12.date > marketHour3.date ? {
											'values.hour12ActualCalculated': true,
											'values.hour12Actual': marketHour12.data.c - marketHour0.data.c,
											'values.hour12ActualPercent': (marketHour12.data.c - marketHour0.data.c) / marketHour0.data.c,
										} : {'values.hour12ActualCalculated': false}),
										// }}}

										// hour24 {{{
										...(_.isObject(marketHour24) && marketHour12 && marketHour24.date > marketHour12.date ? {
											'values.hour24ActualCalculated': true,
											'values.hour24Actual': marketHour24.data.c - marketHour0.data.c,
											'values.hour24ActualPercent': (marketHour24.data.c - marketHour0.data.c) / marketHour0.data.c,
										} : {'values.hour24ActualCalculated': false}),
										// }}}
									},
								};

								// Logging {{{
								if (settings.verbose)
									agent.log(
										'* Tweet ',
										agent.log.colors.cyan(`#${tweet._id}`),
										'0h@', agent.log.colors.yellow(doc.$set['values.hour0Actual']),
										'3h∇', doc.$set['values.hour3ActualCalculated'] ? agent.log.colors.yellow(doc.$set['values.hour3Actual']) : agent.log.colors.red('NED'),
										'12h∇', doc.$set['values.hour12ActualCalculated'] ? agent.log.colors.yellow(doc.$set['values.hour12Actual']) : agent.log.colors.red('NED'),
										'24h∇', doc.$set['values.hour24ActualCalculated'] ? agent.log.colors.yellow(doc.$set['values.hour24Actual']) : agent.log.colors.red('NED'),
									);
								// }}}

								if (doc.$set['values.hour0ActualCalculated']
									&& doc.$set['values.hour3ActualCalculated']
									&& doc.$set['values.hour12ActualCalculated']
									&& doc.$set['values.hour24ActualCalculated'])
									tweetsProcessedComplete++;

								// TODO: replaceOne with upsert: true?
								if (settings.dryRun) {
									agent.log('Update', {
										platform: settings.platform,
										symbol: settings.symbol,
										platform_data: tweet._id,
									}, doc);
								} else {
									// FIXME: setTimeout work-around required here? We're not using MongooseDocument.save
									return app.db.platforms_data_movement.updateOne(
										{
											platform: settings.platform,
											symbol: settings.symbol,
											platform_data: tweet._id,
										},
										doc,
										{ upsert:true }
									);
								}
							})
					})
					.then(()=> {
						agent.log('Processed', tweetsProcessed, 'tweets, of which', tweetsProcessedComplete, 'are data complete');
					})
			});
			// }}}
	},
};
