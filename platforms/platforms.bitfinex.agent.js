/**
 * Agent to collect API data
 *
 * @param {Object} [settings] Settings to configure
 *
 * @example NODE_ENV=slab ./run-agent -d platforms.bitfinex -o symbols=[\"BTCUSD\"]
 */

const { getJSON } = require('jquery');
const _ = require('lodash');
const moment = require('moment');

const app = require('../app/app.backend');

// FIXME: [agents] ERROR Agent error while running the agent "Cannot convert undefined or null to object" platforms.bitfinex

module.exports = {
	id: 'platforms.bitfinex',
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	timing: false,
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		// TODO: Could be CSV like others.
		if (_.isString(settings.symbols)) settings.symbols = JSON.parse(settings.symbols);
		if (_.isString(settings.start)) settings.start = parseInt(settings.start);

		// TODO: Leave before/after up to next step, have this agent do both directions.
		// TODO: _.defaults actually mutates
		const config = _.defaults(settings, {
			direction: 'before', // ENUM['before','after']
			start: undefined,
			useMeta: false, // Use stored meta-data or determine limits by querying
		});

		return Promise.resolve()
			.then(() => agent.log(`Retrieving ${config.symbols.length} tickers from Bitfinex API`))
			.then(() => config.symbols.map((symbol, i) => () => {
				agent.progress('Tickers', i + 1, config.symbols.length);
				agent.log('Processing', symbol);

				return Promise.resolve()
					.then(() => agent.log('Query existing limits for', symbol))
					// TODO: Skip if "start" is specified by parameter
					.then(() => {
						if (config.useMeta) {
							return app.db.platforms_meta.findOne({ platform: 'bitfinex', symbol: symbol });
						} else {
							return Promise.all([
								app.db.platforms_data.findOne({ platform: 'bitfinex', symbol: symbol })
									.sort('-data.d')
									.select('data.d')
									.catch(() => {}),
								app.db.platforms_data.findOne({ platform: 'bitfinex', symbol: symbol })
									.sort('data.d')
									.select('data.d')
									.catch(() => {}),
							]).then(res => {
								if (res.filter(r => r).length < 2) return;

								return {
									data: {
										newest: parseInt(moment(res[0].data.d).utc().format('x')),
										oldest: parseInt(moment(res[1].data.d).utc().format('x')),
									}
								};
							});
						}
					})
					.then(meta => {
						if (meta) {
							// TODO: Recover from corrupted database entries within newest/oldest
							// TODO: Stop doing "before" when all past candles retrieved
							agent.log('Meta-data', meta);
							switch (config.direction) {
								case 'after':
									config.start = meta.data && meta.data.newest;
									break;
								case 'before':
								default:
									config.start = meta.data && meta.data.oldest;
									break;
							}
							agent.log(`Retrieving candles ${config.direction} ${config.start}`);
							return app.agents.run('platforms.bitfinex.ticker', {
								..._.omit(config, ['symbols']),
								symbol: symbol,
							});
						} else {
							agent.log(`Retrieving first batch of candles`);
							return app.agents.run('platforms.bitfinex.ticker', {
								..._.omit(config, ['symbols']),
								symbol: symbol,
							});
						}
					});
			}))
			.then(symbols => Promise.allSeries(symbols));
	},
};
