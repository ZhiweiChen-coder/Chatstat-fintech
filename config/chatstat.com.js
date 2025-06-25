const _ = require('lodash');
module.exports = _.defaultsDeep(
	{
		url: 'https://chatstat.com', // NOTE: Protocol segment will get overridden if SSL is enabled
		port: process.env.PORT || 80, // NOTE: Will get overridden if SSL is enabled
		mongo: {
			uri: 'mongodb://localhost/chatstat',
		},
		papertrail: {
			hostname: 'chatstat.com',
		},
	},
	require('./production'),
);
