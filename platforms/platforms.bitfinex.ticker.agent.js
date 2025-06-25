/**
 * Agent to collect candle data
 *
 * @param {Object} [settings] Settings to configure
 * @param {Boolean} [settings.dupeCheck] Check for duplicates after inserting new data
 * @param {String} [settings.apiUri] ReST endpoint URI at platform
 * @param {String} [settings.direction] Direction in which to retrieve data ENUM: before, after
 * @param {Number} [settings.maxResults] Number of results to request from API
 * @param {Number} [settings.pages] Number of pages of maxResults length to retrieve
 * @param {String} [settings.start] The epoch time at which to begin query
 * @param {String} [settings.symbol] Ticker to query
 * @param {String} [settings.resolution] Candle resolution to query
 *
 * @example NODE_ENV=slab ./run-agent -d platforms.bitfinex.ticker -o pages=2 -o symbol=BTCUSD
 */

const _ = require('lodash');
const moment = require('moment');
const axios = require('axios').default;

const app = require('../app/app.backend');

module.exports = {
	id: 'platforms.bitfinex.ticker',
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	timing: false,
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		if (_.isString(settings.start)) settings.start = parseInt(settings.start);
		if (_.isString(settings.maxResults)) settings.maxResults = parseInt(settings.maxResults);
		if (_.isString(settings.pages)) settings.pages = parseInt(settings.pages);

		// TODO: _.defaults actually mutates
		const config = _.defaults(settings, {
			dupeCheck: false, // TODO: Turn on when given `-d` on CLI
			apiUri: 'https://api-pub.bitfinex.com/v2',
			direction: 'before', // ENUM['before','after']
			maxResults: 10000, // TODO: More generic name rather than Twitter API name?
			pages: 1,
			start: '',
			symbol: '',
			resolution: '1h',
		});

		if (config.maxResults < 1) agent.warn('maxResults below minimum (1)');
		if (config.maxResults > 10000) agent.warn('maxResults above maximum (10000)');

		if (!config.symbol) {
			agent.warn('"symbol" setting must be specified');
			return Promise.reject('"symbol" setting must be specified');
		}

		const qry = {
			limit: config.maxResults,
			sort: -1,
		};

		if (config.start) {
			switch (config.direction) {
				case 'after':
					qry.start = config.start + 1000;
					break;
				case 'before':
					default:
					qry.end = config.start - 1000;
					break;
			}
		}

		const http = axios.create({
			baseURL: config.apiUri,
			timeout: 30000,
			responseType: 'json',
			responseEncoding: 'utf8',
		});

		return new Promise((resolve, reject) => {
			let cnt = 0;
			let results = new Array();

			const requestResults = (qry) => {
				if (!qry) return;

				// Check API and store results {{{
				// Available values: '1m', '5m', '15m', '30m', '1h', '3h', '6h', '12h', '1D', '7D', '14D', '1M'
				const url = '/candles/trade:' + config.resolution + ':t' + config.symbol + '/hist';
				agent.log('Requesting candles with query', url, qry);
				http.get(url, { params: qry, })
					.then(res => {
						agent.log(`Retrieved ${res.data.length} candles from page ${cnt}`);

						// Skip saving when results are empty.
						if (!res || !res.data || res.data.length === 0)
							return Promise.resolve(res);

						// Remap data with OHLC labels
						/*
						[
							MTS,
							OPEN,
							CLOSE,
							HIGH,
							LOW,
							VOLUME
						]
						*/
						res.data = res.data.map(d =>
							({
								platform: 'bitfinex',
								symbol: config.symbol,
								date: new Date(d[0]),
								data: {
									d: d[0],
									o: d[1],
									c: d[2],
									h: d[3],
									l: d[4],
									v: d[5],
								},
							})
						);

						return Promise.resolve()
							.then(() => agent.log(`Saving candles for ${config.symbol}`))
							.then(() => app.db.platforms_data.insertMany(res.data, { lean: true, ordered: false }))
							.then(() => app.db.platforms_meta.findOne({
								platform: 'bitfinex',
								symbol: config.symbol,
							}))
							.then(meta => {
								if (meta) {
									agent.log('Updating meta-data', meta);
								} else {
									agent.log('Creating meta-data', {
										newest: res.data[0].data.d,
										oldest: res.data[res.data.length - 1].data.d,
									});
								}
								return meta;
							})
							// TODO: Any other meta-data we should store other than updating with max/min?
							.then(meta => app.db.platforms_meta.replaceOne(
								{
									platform: 'bitfinex',
									symbol: config.symbol,
								},
								{
									platform: 'bitfinex',
									symbol: config.symbol,
									data: {
										newest: (meta && meta.data && meta.data.newest
											&& moment(meta.data.newest).utc().isAfter(
												moment(res.data[0].data.d).utc()
											)
										) ? meta.data.newest : parseInt(moment(res.data[0].data.d).utc().format('x')),
										oldest: (meta && meta.data && meta.data.oldest
											&& moment(meta.data.oldest).utc().isBefore(
												moment(res.data[res.data.length - 1].data.d).utc()
											)
										) ? meta.data.oldest : parseInt(moment(res.data[res.data.length - 1].data.d).utc().format('x')),
									},
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
					.then(res => (config.dupeCheck) ? app.db.platforms_data.aggregate(
							[
								{
									"$group" : {
										"_id": {
											"d": "$data.d",
											"platform": "$platform",
											"symbol": "$symbol"
										}, "count": { "$sum": 1 }
									}
								},
								{"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1}}}
							]
						)
						.then(dupes => {
							if (!dupes || dupes.length === 0) return;

							agent.warn('Dupes', dupes[0], dupes.length);
							//reject(results);
						})
						.then(() => res) : res
					)
					// }}}


					// Check for further pages {{{
					.then(res => {
						cnt++;

						if (config.pages && cnt < config.pages) {
							delete qry.start;
							delete qry.end;
							if (res && res.data) {
								switch (config.direction) {
									case 'after':
										qry.start = res.data[0].d + 1;
										break;
									case 'before':
									default:
										qry.end = res.data[data.length - 1].d - 1;
										break;
								}
							}

							if (qry.start || qry.end) {
								agent.log('Pagination', qry.start, qry.end);
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
