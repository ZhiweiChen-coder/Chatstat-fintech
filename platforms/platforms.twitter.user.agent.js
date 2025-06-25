/**
 * Agent to collect stream data
 *
 * @param {Object} [settings] Settings to configure
 * @param {String} [settings.apiUri] Root ReST URI for Twitter
 * @param {String} [settings.bearerToken] ReST endpoint authentication token
 * @param {String} [settings.direction] Direction in which to retrieve data ENUM: before, after
 * @param {Boolean} [settings.dupeCheck] Check for duplicates after inserting new data
 * @param {Number} [settings.maxResults] Number of results to request from API
 * @param {Number} [settings.pages] Number of pages of maxResults length to retrieve
 * @param {String} [settings.start] The epoch time at which to begin query
 * @param {String} [settings.user] Twitter user to query
 *
 * @example NODE_ENV=slab ./run-agent -d platforms.twitter.user -o pages=2 -o user="{ \"id\": \"44196397\", \"name\": \"Elon Musk\", \"username\": \"elonmusk\" }"
 */

const { getJSON } = require('jquery');
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios').default;

const app = require('../app/app.backend');

module.exports = {
	id: 'platforms.twitter.user',
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	timing: false,
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		// Support array from CLI. `-o user="{ \"id\": \"44196397\", \"name\": \"Elon Musk\", \"username\": \"elonmusk\" }"`
		// TODO: Could be CSV like others.
		if (_.isString(settings.user)) settings.user = JSON.parse(settings.user);
		if (_.isString(settings.maxResults)) settings.maxResults = parseInt(settings.maxResults);
		if (_.isString(settings.pages)) settings.pages = parseInt(settings.pages);

		// TODO: _.defaults actually mutates
		const config = _.defaults(settings, {
			apiUri: 'https://api.twitter.com/2',
			// TODO: Configurable, private
			bearerToken: 'AAAAAAAAAAAAAAAAAAAAAPC0QQEAAAAA%2FeSFhdCSinXd7tzme8lnrszxQQ0%3DEXylXxA7Vn7nnwrIZExa1IgdenHic4DfVzXiF09yx5spNoI8iw',
			direction: 'before', // ENUM['before','after']
			dupeCheck: false,
			maxResults: 100,
			pages: 1,
			start: '', // Tweet ID to start from
			user: {},
		});

		if (config.maxResults < 5) {
			agent.warn('maxResults below minimum (5)');
			return Promise.reject('maxResults below minimum (5)');
		}
		if (config.maxResults > 100) {
			agent.warn('maxResults above maximum (100)');
			return Promise.reject('maxResults above maximum (100)');
		}

		if (!config.user || !config.user.id || !config.user.username) {
			agent.warn('"user" setting must be specified');
			return Promise.reject('"user" setting must be specified');
		}

		if (config.direction === 'after' && !config.start) {
			agent.warn('Direction "after" requires "start" be specified');
			return Promise.reject('Direction "after" requires "start" be specified');
		}

		const http = axios.create({
			baseURL: config.apiUri,
			timeout: 30000,
			responseType: 'json',
			responseEncoding: 'utf8',
		});
		http.defaults.headers.common['Authorization'] = 'Bearer ' + config.bearerToken;

		const qry = {
			max_results: config.maxResults,
			'tweet.fields': 'id,author_id,text,created_at,geo,public_metrics',
		};

		if (config.start) {
			switch (config.direction) {
				case 'before':
					//qry.until_id = config.start;
					// Expand default 30 days to 90 days
					qry.start_time = new Date(config.start - (1000 * 60 * 60 * 24 * 90)).toISOString().replace('.000Z','Z');
					qry.end_time = new Date(config.start).toISOString().replace('.000Z','Z');
					break;
				case 'after':
				default:
					//qry.since_id = config.start;
					qry.start_time = new Date(config.start + 1000).toISOString().replace('.000Z','Z');
					break;
			}
		}

		return new Promise((resolve, reject) => {
			let cnt = 0;
			let results = new Array();

			const requestResults = (qry) => {
				if (!qry) return;

				// Check API and store results {{{
				agent.log('Requesting Tweets with query', `users/${config.user.id}/tweets`, qry);
				http.get(`/users/${config.user.id}/tweets`, { params: qry })
					.then(res  => {
						agent.log('Rate-limit remaining', res.headers['x-rate-limit-remaining']);
						if (res.headers['x-rate-limit-remaining'] && res.headers['x-rate-limit-remaining'] === 0)
							agent.warn('RATE LIMIT EXCEEDED');

						// NOTE: For debugging purposes
						//if (res.data.meta.result_count === 0)
						//	agent.log('NO RESULTS', res.headers);

						res = res.data;

						agent.log(`Retrieved ${res.meta.result_count} Tweets from page ${cnt}`);

						// Skip saving when results are empty.
						if (!res || !res.data || !res.meta || res.meta.result_count === 0)
							return Promise.resolve(res);

						res.data = res.data.map(d =>
							({
								platform: 'twitter',
								symbol: config.user.username,
								date: new Date(d.created_at),
								data: {
									...d,
									author_name: config.user.name,
								},
							})
						);

						return Promise.resolve()
							.then(() => agent.log(`Saving tweets for ${config.user.id} ${config.user.username}`))
							// TODO: dryRun configurable to enable using agent to check for dupes

							// TODO: Using insertMany doesn't trigger pre-save hook in the same way
							//.then(() => app.db.platforms_data.insertMany(res.data, { lean: true, ordered: false }))

							.then(() => Promise.allSeries(res.data.map(doc => () => app.db.platforms_data.insert(doc))))
							.then(() => agent.log('Saving meta-data'))
							.then(() => app.db.platforms_meta.findOne({
								platform: 'twitter',
								symbol: config.user.username,
							}))
							// TODO: Any other meta-data we should store other than updating with max/min?
							.then(meta => app.db.platforms_meta.replaceOne(
								{
									platform: 'twitter',
									symbol: config.user.username,
								},
								{
									platform: 'twitter',
									symbol: config.user.username,
									data: {
										// Identifiers
										//newest: (meta && meta.data && meta.data.newest && meta.data.newest > res.meta.newest_id) ? meta.data.newest : res.meta.newest_id,
										//oldest: (meta && meta.data && meta.data.oldest && meta.data.oldest < res.meta.oldest_id) ? meta.data.oldest : res.meta.oldest_id,
										// Epochs
										// FIXME: Is it date range which may result in 0 results?
										newest: (meta && meta.data && meta.data.newest
											&& moment(meta.data.newest).utc().isAfter(
												moment(res.data[0].data.created_at).utc()
											)
										) ? meta.data.newest : parseInt(moment(res.data[0].data.created_at).utc().format('x')),
										oldest: (meta && meta.data && meta.data.oldest
											&& moment(meta.data.oldest).utc().isBefore(
												moment(res.data[res.data.length - 1].data.created_at).utc()
											)
										) ? meta.data.oldest : parseInt(moment(res.data[res.data.length - 1].data.created_at).utc().format('x')),
									}
								},
								{
									upsert: true,
								}
							))
							// Return the tweets without meta-data
							.then(() => results = results.concat(res.data))
							.then(() => res);
					})
					// }}}

					// Check for duplicates {{{
					.then(res => (config.dupeCheck) ? app.db.platforms_data.aggregate([
							{"$group" : { "_id": "$data.id", "count": { "$sum": 1 } } },
							{"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } },
						])
						.then(dupes => {
							if (!dupes || dupes.length === 0) return;

							agent.log('Dupes', dupes);
							// FIXME: Throwing an error here may interfere with other agents, Need to fix Doop agents integration.
							throw new Error('Dupes detected');
							//reject(results);
						})
						.then(() => res) : res
					)
					// }}}

					// Check for further pages {{{
					.then(res => {
						cnt++;

						if (config.pages && cnt < config.pages) {
							delete qry.pagination_token;
							if (res && res.meta) {
								switch (config.direction) {
									case 'before':
										qry.pagination_token = res.meta.next_token;
										break;
									case 'after':
									default:
										qry.pagination_token = res.meta.prev_token;
										break;
								}
							}

							if (qry.pagination_token) {
								agent.log('Pagination', qry.pagination_token);
								setTimeout(() => requestResults(qry));
							} else {
								agent.log('Pagination completed, no further pages');
								resolve(results);
							}
						} else {
							agent.log('Pagination completed, page limit reached');
							resolve(results);
						}
					})
					.catch(e => reject(e));
					// }}}
			};

			requestResults(qry);
		});
	},
};
