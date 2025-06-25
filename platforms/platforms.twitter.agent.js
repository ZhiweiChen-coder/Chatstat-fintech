/**
 * Agent to collect API data
 *
 * @param {Object} [settings] Settings to configure
 * @param {String} [settings.apiUri] Root ReST URI for Twitter
 * @param {String} [settings.bearerToken] ReST endpoint authentication token
 * @param {String} [settings.direction] Direction in which to retrieve data ENUM: before, after
 * @param {Boolean} [settings.dupeCheck] Check for duplicates after inserting new data
 * @param {Number} [settings.maxResults] Number of results to request from API
 * @param {Number} [settings.pages] Number of pages of maxResults length to retrieve
 * @param {String} [settings.start] The epoch time at which to begin query
 * @param {Array[String]} [settings.symbols] List of Twitter users to query
 *
 * @example NODE_ENV=slab ./run-agent -d platforms.twitter -o symbols=[\"elonmusk\",\"BillGates\"]
 */

const { getJSON } = require('jquery');
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios').default;

const app = require('../app/app.backend');

// FIXME: Upstream issue?
// WARN When asked to describe proc agent-production-platforms.twitter.movement.actual-9dc9c813e82874e71bec17e04035946fd28747b3c1bd1c94c967670e6fbe9c5b PM2 returned: []

module.exports = {
	id: 'platforms.twitter',
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	timing: false,
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		// Support array from CLI. `-o symbols=[\"elonmusk\",\"BillGates\"]`
		// TODO: Could be CSV like others.
		if (_.isString(settings.symbols)) settings.symbols = JSON.parse(settings.symbols);

		// TODO: API Credentials:
		// App ID: 22324225
		// API-Key: Gf3NufEj11uqIe4fOcBpUt3xX
		// API-Secret: cWIJ15aYj8ALPkoEd45SLNQbwuyL4fEtzTOeJC5dGaEhQKq2GH

		// TODO: _.defaults actually mutates
		const config = _.defaults(_.omit(settings, ['paths', 'symbols']), {
			apiUri: 'https://api.twitter.com/2',
			// TODO: Configurable, private
			bearerToken: 'AAAAAAAAAAAAAAAAAAAAAAGkVAEAAAAAQCVsE2IJsdXWblJnGz2qc%2FTM%2FDY%3DNXIPACSn9YvmWjF6yYsbL1NdUcM7x8ru9MNDCjlokjDMasnj5x',
			direction: 'before', // ENUM['before','after']
			start: undefined,
			useMeta: false, // Use stored meta-data or determine limits by querying
		});

		if (settings.symbols.length === 0) {
			agent.warn('Username list is empty');
			return Promise.reject('Username list is empty');
		}

		const http = axios.create({
			baseURL: config.apiUri,
			timeout: 30000,
			responseType: 'json',
			responseEncoding: 'utf8',
		});
		http.defaults.headers.common['Authorization'] = 'Bearer ' + config.bearerToken;

		return Promise.resolve()
			.then(() => agent.log(`Retrieving ${settings.symbols.length} users from Twitter API`))
			// FIXME: Potentially over-run max-character limits?
			.then(() => http.get('/users/by', { params: { usernames: settings.symbols.join(',') }}))
			.then(({ data: {data: users} })  => {
				// [ { id: '44196397', name: 'Elon Musk', username: 'elonmusk' } ]
				if (!users) {
					agent.warn(`Usernames ${settings.symbols.join(',')} not found`);
					return;
				}

				agent.log('Users', users);
				return users.map((user, i) => () => {
					agent.progress('Users', i + 1, users.length);
					agent.log('Processing', user.id, user.username);

					return Promise.resolve()
						.then(() => agent.log('Query existing limits for', user.id, user.username))
						// TODO: Skip if "start" is specified by parameter
						.then(() => {
							if (config.useMeta) {
								return app.db.platforms_meta.findOne({ platform: 'twitter', symbol: user.username });
							} else {
								return Promise.all([
									app.db.platforms_data.findOne({ platform: 'twitter', symbol: user.username })
										.sort('-data.created_at')
										.select('data.created_at')
										.catch(() => {}),
									app.db.platforms_data.findOne({ platform: 'twitter', symbol: user.username })
										.sort('data.created_at')
										.select('data.created_at')
										.catch(() => {}),
								]).then(res => {
									if (res.filter(r => r).length < 2) return;

									return {
										data: {
											newest: parseInt(moment(res[0].data.created_at).utc().format('x')),
											oldest: parseInt(moment(res[1].data.created_at).utc().format('x')),
										}
									};
								});
							}
						})
						.then(meta => {
							if (meta) {
								// TODO: Recover from corrupted database entries within newest/oldest
								agent.log('Meta-data', meta);
								switch (config.direction) {
									case 'before':
										config.start = meta.data && meta.data.oldest;
										break;
									case 'after':
										config.start = meta.data && meta.data.newest;
										break;
								}
								agent.log(`Retrieving tweets ${config.direction} ${config.start}`);
								return app.agents.run('platforms.twitter.user', {
									...config,
									user: user,
								});
							} else {
								agent.log(`Retrieving first batch of tweets`);
								return app.agents.run('platforms.twitter.user', {
									...config,
									user: user,
								});
							}
						});
				});
			})
			.then(users => Promise.allSeries(users));
	},
};
