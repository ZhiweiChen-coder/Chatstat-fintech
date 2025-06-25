/**
 * Agent to collect API data
 *
 * @param {Object} [settings] Settings to configure
 *
 * @example ./run-agent -d rivers.static
 */

const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const Highcharts = require('highcharts')();

// FIXME: Fails to load correctly with Highcharts v9.3.1
//const dataGrouping = require('highcharts/modules/datagrouping')(Highcharts);

// Work-around for datagrouping not working with NPM module
// @see https://github.com/highcharts/highcharts/issues/12775#issuecomment-591310126
require('highcharts/modules/datagrouping')(Highcharts);
const dataGrouping = Highcharts.dataGrouping;

// FIXME: Work-around monkey-patch to avoid another bug
// @see https://github.com/highcharts/highcharts/issues/12775#issuecomment-974593115
dataGrouping.options = {};

const app = require('../app/app.backend');

module.exports = {
	id: 'rivers.static',
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	timing: false,
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		_.defaults(settings, {
		});

		// TODO: Possible to hit route or share logic without duplication here?
		const processItem = (platform, symbol, terms, start, finish) => {
			agent.log('processItem', platform, symbol, terms, start, finish);

			const qry = {
				platform: platform,
				symbol: symbol,
			};

			return new Promise((resolve, reject) => {
				switch (qry.platform) {
					case 'twitter':
						if (start || finish) qry.date = {};
						if (start) qry.date.$gte = moment(start).utc().toDate();
						if (finish) qry.date.$lt = moment(finish).utc().toDate();
						agent.log('qry', qry);

						app.db.platforms_data
							.find(qry)
							.sort('-date')
							.exec((err, docs) => {
								if (err) return reject(err);
	
								if (terms) {
									// TODO: toString for streams which extracts data.text or whichever field contains the actual content
									docs = docs
										.filter(s => terms
											.some(t => s.data.text.toLowerCase()
												.includes(t.toLowerCase())
											)
										);
								}

								// Limiting responses so that "Load more" pagination can be consistent
								//if (limit > 0 && docs.length > limit) docs.length = limit;

								// TODO: Create directory when required
								fs.promises.writeFile(
									`${app.config.paths.root}/platforms/static/${qry.platform}/${qry.symbol}.json`,
									JSON.stringify(docs, null, 2),
									'utf8'
								)
								.catch(reject)
								.finally(resolve);
							});
						break;
					case 'bitfinex':
					default:
						if (start || finish) qry.date = {};
						if (start) qry.date.$gte = moment(start).utc().toDate();
						if (finish) qry.date.$lt = moment(finish).utc().toDate();
						agent.log('qry', qry);

						app.db.platforms_data
							.find(qry)
							.sort('date') // Only difference between Bitfinex and Twitter? dataGrouping and no dataGrouping?
							.exec((err, docs) => {
								if (err) return reject(err);

								// TODO: Create directory when required
								fs.promises.writeFile(
									`${app.config.paths.root}/platforms/static/${qry.platform}/${qry.symbol}.json`,
									JSON.stringify(docs, null, 2),
									'utf8'
								)
								.catch(reject)
								.finally(resolve);
							});
						break;
				}
			});
		};

		Promise.resolve()
			// Generate JSON file for static rivers {{{
			.then(() => agent.log('Querying static rivers'))
			.then(() => app.db.rivers.find({ static: true, status: 'active' }).sort('-now'))
			.then(rivers => fs.promises
				.writeFile(
					`${app.config.paths.root}/rivers/static/static.json`,
					JSON.stringify(rivers, null, 2),
					'utf8'
				).then(() => rivers)
			)
			// }}}
			// Generate JSON file for static platform data {{{
			.then(rivers => {
				agent.log('Querying platform data');
				return rivers;
			})
			.then(rivers => {
				// FIXME: Determine latest for each platform/symbol combo.
				let latest;// = moment(new Date(0)).utc();
				rivers.forEach(r => {
					if (r.now && (!latest || moment(r.now).utc().isAfter(latest)))
						latest = moment(r.now).utc()
				});
				if (!latest) latest = moment().utc().endOf('day');
				agent.log(`Querying platform data before ${latest}`);

				return rivers.map(r => ([
					...r.streams.map(item => () => processItem(
						item.platform,
						item.symbol,
						r.terms.filter(t => t.isActive).map(t => t.term),
						new Date(0),
						latest.toDate()
					)),
					...r.flows.map(item => () => processItem(
						item.platform,
						item.symbol,
						r.terms.filter(t => t.isActive).map(t => t.term),
						new Date(0),
						latest.toDate()
					)),
				]));
			})
			.then(promises => Promise.allSeries(_.flatten(promises)))
			// }}}
			.catch(e => {
				agent.warn(e.toString());
				done();
			})
			.finally(() => done());

	},
};
