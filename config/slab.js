const _ = require('lodash');
module.exports = _.defaultsDeep(
	{
		url: 'http://slab',
		email: {
			enabled: true,
		},
	},
	require('./dev'),
);
