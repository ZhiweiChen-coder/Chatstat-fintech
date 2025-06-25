<script lang="js" frontend>
// TODO: Import only d3Format
import * as d3 from 'd3';
import Highcharts from 'highcharts/highstock';

/**
* Displays flow within a HighCharts chart
*
* @param {Object} config
* @param {Array} data Chart data series
*
*/
app.component('riversViewChartLine', {
	// TODO: Simply inject? Maybe these are generic reusable components.
	// inject: ['riversViewResults'],
	data() { return {
		chart: undefined,
	}},
	props: {
		config: {type: Object},
		flowData: {type: Array},
		streamsData: {type: Array},
		river: {type: Object},
	},
	methods: {
		/**
		 * Draw HighCharts chart given price data
		 */
		updateSeries(data, series = 0) {
			_.defaults(this.config, {
			});
			this.$debug('updateSeries', this.config, data, series);

			this.$loader.startBackground('riversViewChartLine.update');
			this.chart.showLoading('Loading data from server...');
			console.time('riversViewChartLine.update');

			// FIXME: Retaining previous data also? Switching to an item with few tweets still shows many.
			this.chart.series[series].setData(data);

			// Update navigator with new series
			if (series === 0) {
				this.$debug('Update Navigator', this.river?._id);
				this.chart.get('navigator').setData(data, false);
			}

			this.chart.hideLoading();
			this.$loader.stop('riversViewChartLine.update');
			console.timeEnd('riversViewChartLine.update');
		},

		/**
		 * Respond to changes in navigator selection
		 */
		updatePeriod(e) {
			this.$debug('updatePeriod', e);

			this.$emit('change', {
				oldest: e.min,
				newest: e.max,
			});
		},
	},
	mounted() {
		this.$debug.enable(false);

		_.defaults(this.config, {
			formatDate: '%d %b', // '%-m-%-d-%Y' - '%B %-d, %Y',
			//formatValue: '.2f',
			formatValue: {
				fill: " ",
				align: ">",
				sign: "-",
				symbol: "",
				zero: false,
				width: undefined,
				comma: false,
				precision: undefined,
				trim: false,
				type: "f"
			},
			formatLocale: {
				decimal: '.',
				thousands: ',',
				grouping: [3],
				currency: ['$', ' '],
			},
		});
		//  "Month: %m Day: %d Year: %Y"
		//Highcharts.dateFormat(this.config.formatDate, 20, false);

		const formatDate = d3.utcFormat(this.config.formatDate);
		const formatValue = d3
			.formatLocale(this.config.formatLocale)
			.format(new d3.FormatSpecifier(this.config.formatValue));

		this.chart = new Highcharts.StockChart(this.$el, {
			chart: {
				height: 350,
			},

			time: {
				moment: moment,
				useUTC: true,
			},
			navigator: {
				adaptToUpdatedData: false,
				series: {
					id: 'navigator',
					data: this.flowData
				}
			},
			scrollbar: {
				liveRedraw: false
			},
			rangeSelector: {
				buttons: [
					{
						type: 'day',
						count: 1,
						text: '1D'
					},
					{
						type: 'day',
						count: 5,
						text: '5D'
					},
					{
						type: 'month',
						count: 1,
						text: '1M'
					},
					{
						type: 'month',
						count: 6,
						text: '6M'
					},
					// TODO: YTD?
					{
						type: 'year',
						count: 1,
						text: '1Y'
					},
					{
						type: 'year',
						count: 5,
						text: '5Y'
					},
					{
						type: 'all',
						text: 'Max'
					},
				],
				inputEnabled: false, // it supports only days
				selected: 3 // 6M
			},
			/*
			rangeSelector: {
				//enabled: false,
				selected: 5,
			},
			*/
			xAxis: {
				//id: 'datetime',
				events: {
					afterSetExtremes: this.updatePeriod,
				},
				minRange: 3600 * 1000, // 1h
			},

			yAxis: {
				id: 'price',
				title: {
					text: 'Price'
				},
				type: 'logarithmic',
				//floor: 0, // When specified type: 'flag' breaks down
			},

			tooltip: {
				enabled: true,
				formatter:function() {
					const point = Highcharts.splat(this.point);

					if(point[0] && point[0].series.options.type == 'flags') {
						//return Highcharts.dateFormat('%A, %B %d, %Y',point[0].x)
						return formatDate(point[0].x)
							+ '<br>'
							+ formatValue(point[0].y)
							+ '<br>'
							+ point[0].text;
					} else {
						return false;
					}
				}
			},

			plotOptions: {
				flags: {
					states: {
						inactive: {
							opacity: 1.0,
						},
					},
					allowOverlapX: true,
					clip: false,
					turboThreshold: 2500,
				},
				line: {
					states: {
						hover: {
							lineWidthPlus: 0,
						},
						inactive: {
							opacity: 1.0,
						},
					},
				},
			},
			series: [
				{
					id: 'flow',
					name: 'Flow',
					type: 'line',
					//data: this.flowData,
					dataGrouping: {
						enabled: false,
					},
					pointInterval: 1000 * 60 * 60, // 1h
					yAxis: 'price'
				},
				{
					//id: 'stream',
					name: 'Stream',
					type: 'flags',
					//data: this.streamsData,
					dataGrouping: {
						enabled: false
					},
					onSeries: 'flow',
					shape: 'circlepin',
					width: 16,
					yAxis: 'price'
				},
			],
			title: {
				text: '',
			},
			subtitle: {
				text: '',
			},
		});

		// FIXME: Not coupled to promises so can happen out-of-sequence
		/*
		this.$watch('$props.flowData', () => {
			if (!this.$props.flowData) return;
			this.$debug('$watch.flowData', this.flowData);

			//this.updateSeries(this.flowData, 0);
		}, {immediate: true, deep: true});
		*/

		this.$watch('$props.streamsData', () => {
			if (!this.$props.streamsData) return;
			this.$debug('$watch.streamsData', this.streamsData.length, this.flowData.length);

			// NOTE: When flags are `onSeries: 'flow'` this series must be set first.
			// Otherwise y-axis extents will be incorrectly defined,
			// and chart will look flat when switching between flows.
			this.updateSeries(this.flowData, 0);

			this.updateSeries(_(this.streamsData)
				.sortBy('date') // Sort before assigning titles
				.map((d, i) => ({
					//x: parseInt(moment(d.data.created_at).utc().format('x')),
					x: parseInt(moment(d.date).utc().format('x')),
					title: String.fromCharCode((i % 26) + 65),
					text: d.data.text,
				}))
				// FIXME: Redundant, was being paranoid
				.sortBy('x') // Ensure correctly sorted for HighCharts
				.value()
			, 1);

		}, {immediate: true, deep: true});
	},

});
</script>

<template>
	<div class="rivers-view-chart-line">
		<div v-if="$debug.$enable" v-permissions="'debug'" class="card">
			<div class="card-header">
				Properties
				<i
					class="float-right fas fa-debug fa-lg"
					v-tooltip="'Only visible to users with the Debug permission'"
				/>
			</div>
			<div class="card-body">
				<pre>{{ $props }}</pre>
			</div>
		</div>
	</div>
</template>

// rivers.view.chart.line.vue
//
// Usage:
//   <riversViewChartLine :flowData="teslaPrices" :streamsData="teslaTweets" />
//
// - flowData: Array of [timestamp, price] pairs for the price line (e.g., Tesla stock)
// - streamsData: Array of { date, data: { text } } objects for tweet/event annotations
//
// The parent component should fetch and format the data, then pass as props.
// This component will render a Highcharts line chart with tweet/event flags.
//
// Example parent usage:
//   <riversViewChartLine :flowData="teslaPrices" :streamsData="teslaTweets" />
//
// See documentation below for more details.
