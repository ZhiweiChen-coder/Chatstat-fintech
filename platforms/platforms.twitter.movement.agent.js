/**
* Examine a series of tweets and calculate market movement (either by ID or from tweets that have no existing movement analysis)
*
* @example Examine tweets showing output of each
* ./run-agent platforms.twitter.movement -o dryRun -o verbose -o force
*/

const _ = require('lodash');
const moment = require('moment');

module.exports = {
	id: 'platforms.twitter.movement',
	timing: '15/30 * * * *', // Every 30mins, starting at 15mins past the hour
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		// TODO: _.defaults actually mutates
		const config = _.defaults(settings, {
		});

		return Promise.resolve()
			.then(()=> app.db.rivers.find())
			.then(rivers =>
				// Each river sequentially
				Promise.allSeries(rivers.map(r => () =>
					// Each movement type sequentially
					Promise.allSeries(['actual', 'estimate'].map(type => () =>
						// Each flow sequentially
						Promise.allSeries(r.flows.map(f => () =>
							Promise.resolve()
								.then(() => agent.log(`Calculating movement (${type}) for ${r._id} ${f.platform}/${f.symbol}`))
								.then(() => app.agents.run(`platforms.twitter.movement.${type}`, {
									...config,
									river: r._id,
									platform: f.platform,
									symbol: f.symbol,
								}))
								.then(() => agent.log(`Calculated movement (${type}) for ${r._id} ${f.platform}/${f.symbol}`))
						))
					))
				))
			)
			.then(() => agent.log(`Completed processing twitter movement.`));
	},
};
