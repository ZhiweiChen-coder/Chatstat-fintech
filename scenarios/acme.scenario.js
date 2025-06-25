module.exports = {
	users: [
		{
			$: '$users.ag',
			username: 'adam@mfdc.io',
			email: 'adam@mfdc.io',
			password: 'qwaszx',
			permissions: {
				debug: true,

				usersCreate: true,
				usersRead: true,
				usersUpdate: true,
				usersDelete: true,
				//usersInvite: true,
				//usersPromote: true,

				riversCreate: true,
				riversRead: true,
				riversUpdate: true,
				riversDelete: true,

				riversGlobalCreate: true,
				riversStaticCreate: true,
			},
			status: 'active',
		},
		{
			$: '$users.lk',
			username: 'ljkusz@gmail.com',
			email: 'ljkusz@gmail.com',
			password: 'qwaszx',
			permissions: {
				debug: true,

				usersCreate: true,
				usersRead: true,
				usersUpdate: true,
				usersDelete: true,
				//usersInvite: true,
				//usersPromote: true,

				riversCreate: true,
				riversRead: true,
				riversUpdate: true,
				riversDelete: true,

				riversGlobalCreate: true,
				riversStaticCreate: true,
			},
			status: 'active',
		},
		{
			$: '$users.mc',
			username: 'matt@mfdc.io',
			email: 'matt@mfdc.io',
			password: 'qwaszx',
			permissions: {
				debug: true,

				usersCreate: true,
				usersRead: true,
				usersUpdate: true,
				usersDelete: true,
				//usersInvite: true,
				//usersPromote: true,

				riversCreate: true,
				riversRead: true,
				riversUpdate: true,
				riversDelete: true,

				riversGlobalCreate: true,
				riversStaticCreate: true,
			},
			status: 'active',
		},
	],
	rivers: [
		{
			$: '$rivers.musk.bitcoin',
			title: 'Elon Musk vs. Bitcoin',
			streams: [
				{
					//$: '$stream.twitter.elonmusk',
					title: 'Elon Musk (Twitter)',
					symbol: 'elonmusk',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'Bitcoin',
					symbol: 'BTCUSD',
					//market: 'NASDAQ',
					platform: 'bitfinex',
				},
			],
			terms: [
				{term: '#bitcoin'},
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.musk.doge',
			title: 'Elon Musk vs. Dogecoin',
			streams: [
				{
					//$: '$stream.twitter.elonmusk',
					title: 'Elon Musk (Twitter)',
					symbol: 'elonmusk',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'DogeCoin Crypto vs. USD',
					symbol: 'DOGE:USD',
					platform: 'bitfinex',
				},
			],
			terms: [
				{term: 'Doge'},
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.musk.tesla',
			title: 'Elon Musk vs. Tesla',
			streams: [
				{
					//$: '$stream.twitter.elonmusk',
					title: 'Elon Musk (Twitter)',
					symbol: 'elonmusk',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'Tesla stock',
					symbol: 'TSLA',
					//market: 'NASDAQ',
					platform: 'nasdaq',
				},
			],
			terms: [
				{term: 'Earnings'},
				{term: 'Mars'},
				{term: 'Moon'},
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.gates',
			title: 'Bill and Melinda Gates',
			streams: [
				{
					//$: '$stream.twitter.BillGates',
					title: 'Bill Gates (twitter)',
					symbol: 'BillGates',
					platform: 'twitter',
				},
				{
					//$: '$stream.twitter.melindagates',
					title: 'Melinda Gates (twitter)',
					symbol: 'melindagates',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'Microsoft Stock',
					symbol: 'MSFT',
					//market: 'NASDAQ',
					platform: 'nasdaq',
				},
				{
					title: 'Apple Stock',
					symbol: 'APPL',
					//market: 'NASDAQ',
					platform: 'nasdaq',
				},
			],
			terms: [],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.twitter',
			title: 'Jack Dorsey (Twitter) vs. Bitcoin',
			streams: [
				{
					title: 'Jack Dorsey',
					symbol: 'jack',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'BTC vs. USD',
					symbol: 'BTCUSD',
					platform: 'bitfinex',
				},
			],
			terms: [
				{term: 'btc'},
				{term: 'bitcoin'},
				{term: 'twitter'},
				{term: 'tweet'}
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.apple',
			title: 'Tim Cook vs. Apple Stock',
			streams: [
				{
					title: 'Jack Dorsey',
					symbol: 'jack',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'Apple Stock',
					symbol: 'APPL',
					platform: 'nasdaq',
				}
			],
			terms: [
				{term: 'apple'},
				{term: 'appl'},
				{term: 'stock'}],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.buterin',
			title: 'Vitalik Buterin vs. Ethereum',
			streams: [
				{
					title: 'Vitalik Buterin',
					symbol: 'VitalikButerin',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'ETH vs. USD',
					symbol: 'ETHUSD',
					platform: 'bitfinex',
				},
			],
			terms: [
				{term: 'ethereum'},
				{term: 'eth'}
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.hastings',
			title: 'Reed Hastings vs. Netflix',
			streams: [
				{
					title: 'Reed Hastings',
					symbol: 'reedhastings',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'Netflix Stock',
					symbol: 'NFLX',
					platform: 'nasdaq',
				}
			],
			terms: [
				{term: 'netflix'},
				{term: 'nflx'}
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
		{
			$: '$rivers.aron',
			title: 'Adam Aron vs. Netflix',
			streams: [
				{
					title: 'Adam Aron',
					symbol: 'ceoadam',
					platform: 'twitter',
				},
			],
			flows: [
				{
					title: 'Netflix Stock',
					symbol: 'amc',
					platform: 'nasdaq',
				}
			],
			terms: [
				{term: 'amc'}
			],
			users: [
				{user: '$users.ag'},
				{user: '$users.lk'},
				{user: '$users.mc'},
			],
		},
	],
};
