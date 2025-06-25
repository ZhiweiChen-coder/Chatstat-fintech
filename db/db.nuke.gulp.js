const _ = require('lodash');
const mongoose = require('mongoose');

const gulp = require('gulp');

gulp.task('db:nuke', 'load:app', ()=> {
	if (app.config.env == 'production' && (!process.env.NUKE || process.env.NUKE != 'FORCE')) throw new Error('Refusing to nuke database in production! If you REALLY want to do this set `export NUKE=FORCE`');

	return Promise.resolve()
		.then(()=> _.last(app.config.mongo.uri.split('/')))
		.then(dbName => dbName || Promise.reject('Cannot determine DB name from app.config.mongo.uri'))
		.then(()=> mongoose.connect(app.config.mongo.uri, {useUnifiedTopology: true, useNewUrlParser: true}))
		.then(connection => mongoose.connection.db.dropDatabase())
		// 插入演示数据
		.then(async () => {
			const rivers = mongoose.connection.collection('rivers');
			const platforms_data = mongoose.connection.collection('platforms_data');
			const platforms_data_movement = mongoose.connection.collection('platforms_data_movement');

			// Step 1: river
			const riverResult = await rivers.insertOne({
				title: "TSLA Twitter Watch",
				enabled: true,
				flows: [{ platform: "bitfinex", symbol: "TSLA" }],
				streams: [{ platform: "twitter", symbol: "TSLA" }],
				terms: [{ term: "TSLA", isActive: true }],
				status: "active",
				global: true
			});

			// Step 2: 蜡烛图
			await platforms_data.insertOne({
				platform: "bitfinex",
				symbol: "TSLA",
				date: new Date(),
				data: { d: new Date().getTime(), o: 168.0, c: 170.2, h: 171.0, l: 167.5, v: 1200000 }
			});

			// Step 3: 推文
			const tweetResult = await platforms_data.insertOne({
				platform: "twitter",
				symbol: "TSLA",
				date: new Date(),
				data: { text: "TSLA is going to break 180 this week 🚀", sentiment: 0.75 }
			});

			// Step 4: movement
			await platforms_data_movement.insertOne({
				platform: "bitfinex",
				symbol: "TSLA",
				values: {
					hour0ActualCalculated: true,
					hour0Actual: 170.2,
					hour3ActualCalculated: true,
					hour3Actual: 2.0,
					hour3ActualPercent: 0.0118,
					hour12ActualCalculated: true,
					hour12Actual: 4.5,
					hour12ActualPercent: 0.026,
					hour24ActualCalculated: true,
					hour24Actual: 3.8,
					hour24ActualPercent: 0.022
				},
				platform_data: tweetResult.insertedId
			});

			// Print all rivers
			const allRivers = await rivers.find();
			console.log(allRivers);
		})
		.then(()=> mongoose.disconnect())
});
