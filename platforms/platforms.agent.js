/**
 * Agent to collect stream data
 *
 * @param {Object} [settings] Settings to configure
 * @param {Boolean} [settings.paths] Paths within River model where platforms may be found
 *
 * @example NODE_ENV=slab ./run-agent -d platforms
 * @example NODE_ENV=slab ./run-agent -d platforms -o paths=[\"flows\",\"streams\"] -o platforms=[\"twitter\"]
 */

const _ = require('lodash');

const app = require('../app/app.backend');

module.exports = {
	id: 'platforms',
	hasReturn: false,
	show: true,
	methods: ['pm2', 'inline'],
	timing: '*/30 * * * *', // Every 30mins
	expires: false,
	worker: function (done, settings) {
		const agent = this;

		if (_.isString(settings.paths)) settings.paths = JSON.parse(settings.paths);
		if (_.isString(settings.platforms)) settings.platforms = JSON.parse(settings.platforms);

		_.defaults(settings, {
			// TODO: Implement limit in a way where subsequent runs will pickup those which were skipped.
			//limit: 200, // Number of items to process within each path/platform
			paths: ['streams', 'flows'],
		});

		return Promise.allSeries(settings.paths.map(path => () => {
			agent.log('Path:', path);

			let platforms = settings.platforms;
			if (!platforms) platforms = app.db.rivers.schema
				.subpaths[path + '.platform'].enumValues;
			agent.log('Platforms:', platforms);

			return Promise.allSeries(platforms.map((platform, i) => () => {
				// FIXME: Why never getting to 3/3?
				agent.progress('Platform', i + 1, platforms.length);
				agent.log('Processing:', platform);

				return app.db.rivers.find(
					{[path + '.platform']: platform},
					{[path + '.symbol']: 1},
					//{limit: settings.limit}
				)
				.then(rivers => _(rivers)
					.map(r => r[path].map(p => p.symbol))
					.flattenDeep()
					.uniq()
					.value())
				// FIXME: get or force run? Configurable switch.
				.then(symbols =>
					Promise.allSeries([
						() => app.agents.run('platforms.' + platform, {
							..._.omit(settings, ['paths', 'platforms']),
							direction: 'before',
							symbols: symbols,
						}),
						() => app.agents.run('platforms.' + platform, {
							..._.omit(settings, ['paths', 'platforms']),
							direction: 'after',
							symbols: symbols,
						}),
					])
					.catch(e => {
						// Suppress missing agent errors
						if (e.toString() !== 'Error: Agent "platforms.' + platform + '" is invalid') throw e;
					})
				)
			}));
		}));
	},
};
