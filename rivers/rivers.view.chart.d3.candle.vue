<script lang='js' frontend>
import * as d3 from 'd3';

/**
* Displays flow within a D3JS chart
*
* @param {Object} config 
* @param {Array} data Chart data series
*
*/
app.component('riversViewChartD3Candle', {
	// TODO: Simply inject? Maybe these are generic reusable components.
	// inject: ['riversViewResults'],
	props: {
		config: {type: Object},
		data: {type: Array},
	},
	methods: {
		/**
		 * Draw D3 chart given price data
		 */
		update() {
			const config = _.defaults(this.config, {
				margins: { top: 20, right: 30, bottom: 30, left: 40 },
				formatDate: '%B %-d, %Y',
				formatValue: '.2f',
			});
	
			this.$debug('update', config, this.data);
			this.$loader.startBackground('riversViewChartCandle.update');
			console.time('riversViewChartCandle.update');

			const svg = d3.select(this.$el).select('svg');

			// We recalculate with window resize events so that both width and height can be responsive
			const height = this.$el.clientHeight;
			const width = this.$el.clientWidth;
			svg.attr('viewBox', [0, 0, width, height]);
			svg.attr('preserveAspectRatio', 'none');

			const formatDate = d3.utcFormat(config.formatDate);
			const formatValue = d3.format(config.formatValue);
			const formatChange = (y0, y1) => d3.format('+.2%')((y1 - y0) / y0);

			if (!this.data || this.data.length === 0) {
				svg.select('g.chart-candle-axis').remove();
				svg.select('g.chart-candle-contents').remove();
				return;
			}

			// TODO: Allow range to be specified by property
			const range = [this.data[0].d, this.data[this.data.length - 1].d];

			const xAxis = g => g
				.attr('transform', `translate(0,${height - config.margins.bottom})`)
				.call(d3.axisBottom(x)
					.tickValues(d3.utcMonday
						.every(width > 720 ? 1 : 2)
						.range(...range))
					.tickFormat(d3.utcFormat('%-m/%-d')))
				.call(g => g.select('.domain').remove())

			const yAxis = g => g
				.attr('transform', `translate(${config.margins.left},0)`)
				.call(d3.axisLeft(y)
					.tickFormat(d3.format('$~f'))
					.tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
				.call(g => g.selectAll('.tick line').clone()
					.attr('stroke-opacity', 0.2)
					.attr('x2', width - config.margins.left - config.margins.right))
				.call(g => g.select('.domain').remove())

			const x = d3.scaleBand()
				.domain(d3.utcDay
					.range(this.data[0].d, +this.data[this.data.length - 1].d + 1))
				.range([config.margins.left, width - config.margins.right])
				.padding(0.2);

			const y = d3.scaleLog()
				.domain([d3.min(this.data, d => d.l), d3.max(this.data, d => d.h)])
				.rangeRound([height - config.margins.bottom, config.margins.top])

			// TODO: Join data
			svg.append('g')
				.call(xAxis);

			svg.append('g')
				.call(yAxis);

			// TODO: Append during mount and join thereafter
			const g = svg.append('g')
				.selectAll('g')
				.data(this.data)
				.join('g')
					.attr('class', d => 'chart-candle '
						+ (
							(d.o > d.c) ? 'chart-candle-neg'
							: (d.o < d.c) ? 'chart-candle-pos'
							: ''
						)
					)
					.attr('transform', d => `translate(${x(d.d)},0)`);

			g.append('line')
				.attr('y1', d => y(d.l))
				.attr('y2', d => y(d.h));

			g.append('line')
				.attr('y1', d => y(d.o))
				.attr('y2', d => y(d.c))
				.attr('stroke-width', x.bandwidth())
				//.attr('stroke', d => d.o > d.c ? d3.schemeSet1[0]
				//    : d.c > d.o ? d3.schemeSet1[2]
				//    : d3.schemeSet1[8]);

			g.append('title')
				.text(d => `${formatDate(d.d)}
					Open: ${formatValue(d.o)}
					Close: ${formatValue(d.c)} (${formatChange(d.o, d.c)})
					Low: ${formatValue(d.l)}
					High: ${formatValue(d.h)}
					Streams: ${d.streams.length}`
				);

			const streams = g.filter(d => d.streams.length > 0)
				.append('g')
					.classed('chart-candle-stream', true)
					.attr('transform', d => `translate(0,${(
						(d.o > d.c) ? y(d.h) - 3 - 10
						: (d.o < d.c) ? y(d.l) + 3 + 10
						: y(d.o)
					)})`);

			streams.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 12);
			streams.append('text')
				.attr('y', 5)
				.text(d => d.streams.length);

			this.$loader.stop('riversViewChartCandle.update');
			console.timeEnd('riversViewChartCandle.update');
		},
	},
	mounted() {
		this.$debug.enable(false);

		d3.select(this.$el).append('svg');

		this.$watch('$props.data', () => {
			//if (!this.$props.data) return;
			this.update();
		}, {immediate: true, deep: true});

		window.addEventListener('resize', this.update);
	},
});
</script>

<template>
	<div class='rivers-view-chart-candle'>

		<div v-if="$debug.$enable" v-permissions="'debug'" class='card'>
			<div class='card-header'>
				Properties
				<i class='float-right fas fa-debug fa-lg' v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class='card-body'>
				
				<pre>{{$props}}</pre>

			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.rivers-view-chart-candle {
		height: 100%;
		width: 100%;
		min-height: 250px;
	}

	.chart-candle {
		stroke-linecap: butt;
		stroke: black;
		.chart-candle-stream {
			circle {
				fill: var(--main);
				stroke: var(--main-darker);
			}
			text {
				fill: black;
				stroke: black;
			}
			text-anchor: middle;
			transform-origin: center;
		}
	}

	.chart-candle-neg {
		stroke: rgb(228, 26, 28);
		//.stream {
		//    fill: darken(rgb(228, 26, 28), 10%);
		//    stroke: darken(rgb(228, 26, 28), 20%);
		//}
	}

	.chart-candle-pos {
		stroke: rgb(77, 175, 74);
		//.stream {
		//    fill: darken(rgb(77, 175, 74), 10%);
		//    stroke: darken(rgb(77, 175, 74), 20%);
		//}
	}
</style>
