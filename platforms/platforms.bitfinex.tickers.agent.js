/**
 * Agent to fetch list of supported tickers from Bitfinex
 *
 * @param {Object} [settings] Settings to configure
 *
 * @example NODE_ENV=slab ./run-agent -d platforms.bitfinex.tickers
 */

const _ = require('lodash');
const axios = require('axios').default;

const http = axios.create({
	timeout: 30000,
	responseType: 'json',
	responseEncoding: 'utf8',
});

module.exports = {
	id: 'platforms.bitfinex.tickers',
	hasReturn: true,
	show: true,
	methods: ['pm2', 'inline'],
	timing: false,
	expires: '6h',
	worker: function (done, settings) {
		const agent = this;

		// TODO: _.defaults actually mutates
		const config = _.defaults(settings, {
			apiUri: 'https://api-pub.bitfinex.com/v2',
		});

		agent.log('Retrieving tickers from Bitfinex');
		return http.get(config.apiUri + '/conf/pub:list:pair:exchange')
			.then(({data}) => data && data[0]);
	},
};
