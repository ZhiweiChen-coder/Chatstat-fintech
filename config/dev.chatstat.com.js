const _ = require('lodash');
module.exports = _.defaultsDeep(
	{
		url: 'https://dev.chatstat.com', // NOTE: Protocol segment will get overridden if SSL is enabled
		port: process.env.PORT || 80, // NOTE: Will get overridden if SSL is enabled
		mongo: {
			uri: 'mongodb://localhost/chatstat-dev',
		},
		papertrail: {
			enabled: false,
			hostname: 'dev.chatstat.com',
		},
		sentry: {
			enabled: false,
		},
	},
	require('./production'),
);
