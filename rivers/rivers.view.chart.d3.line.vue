<script lang='js' frontend>
import * as d3 from 'd3';

/**
* Displays flow within a D3JS chart
*
* @param {Object} config
* @param {Array} data Chart data series
*
*/
app.component('riversViewChartD3Line', {
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
				//prefix: 'chart-line', // TODO: Use to specify class names
				margins: { top: 20, right: 30, bottom: 50, left: 60 },
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

			this.$debug('update', config, this.data);
			this.$loader.startBackground('riversViewChartLine.update');
			console.time('riversViewChartLine.update');

			const svg = d3.select(this.$el).select('svg');

			// We recalculate with window resize events so that both width and height can be responsive
			const height = this.$el.clientHeight;
			const width = this.$el.clientWidth;
			svg.attr('viewBox', [0, 0, width, height]);
			svg.attr('preserveAspectRatio', 'none');

			const formatDate = d3.utcFormat(config.formatDate);
			const formatValue = d3
				.formatLocale(config.formatLocale)
				.format(new d3.FormatSpecifier(config.formatValue));

			//const formatChange = (y0, y1) => d3.format('+.2%')((y1 - y0) / y0);

			if (!this.data || this.data.length === 0) {
				svg.select('g.chart-line-axis').remove();
				svg.select('g.chart-line-contents').remove();
				return;
			}

			// TODO: Allow range to be specified by property
			const range = [this.data[0].d, this.data[this.data.length - 1].d];

			const tickResolution = (d3.timeDay.count(...range) < 7) ? 'utcDay' : 'utcMonday';
			this.$debug('range', range, d3.timeDay.count(...range), tickResolution);
			const xAxis = g => g
				.attr('transform', `translate(0,${height - config.margins.bottom})`)
				.call(d3.axisBottom(x)
					.tickValues(d3[tickResolution]
						.every(width > 720 ? 1 : 2)
						.range(...range))
					.tickFormat(formatDate)) // '%-m/%-d'
				.call(g => g.select('.domain').remove())
			const yAxis = g => g
				.attr('transform', `translate(${config.margins.left},0)`)
				.call(d3.axisLeft(y)
					.tickFormat(formatValue) // '$~f'
					.tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
				.call(g => g.selectAll('.tick line').clone()
					.attr('stroke-opacity', 0.2)
					.attr('x2', width - config.margins.left - config.margins.right))
				.call(g => g.select('.domain').remove())

			const x = d3.scaleTime()
				// .domain(d3.utcDay
				// .range(this.data[0].d, +this.data[this.data.length - 1].d + 1))
				.domain(d3.extent(this.data, d => d.d))
				.range([config.margins.left, width - config.margins.right]);
			const y = d3.scaleLog()
				.domain([d3.min(this.data, d => d.c), d3.max(this.data, d => d.c)])
				.rangeRound([height - config.margins.bottom, config.margins.top])

			// FIXME: Join or Remove and Append?
			svg.select('g.chart-line-axis').remove();
			const a = svg.append('g').classed('chart-line-axis', true);

			a.append('g')
				.attr('class', 'chart-line-x-axis')
				.call(xAxis)
					// Rotate labels
					.selectAll("text")	
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function(d) {
						return "rotate(-65)" 
					});

			a.append('g')
				.attr('class', 'chart-line-y-axis')
				.call(yAxis);

			// FIXME: Join or Remove and Append?
			svg.select('g.chart-line-contents').remove();
			const c = svg.append('g').classed('chart-line-contents', true);

			c.append('g')
				.classed('chart-line-path', true)
				.datum(this.data)
				.append('path')
					.attr('fill', 'none')
					.attr('stroke', 'steelblue')
					.attr('stroke-width', 1.5)
					.attr('d', d3.line()
						.x(d => x(d.d))
						.y(d => y(d.c))
					);

			const g = c.append('g')
				.classed('chart-line-candles', true)
				.selectAll('g')
				.data(this.data)
				.join('g')
					.classed('chart-line-candle', true)
					.attr('transform', d => `translate(${x(d.d)},0)`);

			g.append('rect')
				.attr('width', '.5px')
				.attr('height', height - config.margins.bottom - config.margins.top)
				.attr('transform', d => `translate(0,${config.margins.top})`);

			const streams = g.filter(d => d.streams.length > 0)
				.append('g')
					.classed('chart-line-stream', true)
					.attr('transform', d => `translate(0,${y(d.c)})`);

			streams.append('circle')
				.classed('chart-line-symbol', true)
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 12)
			streams.append('text')
				.attr('y', 5)
				.text(d => d.streams.length);

			streams.append('circle')
				.classed('chart-line-hover', true)
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 12)
				.on('mouseover', (e, d) => {
					// TODO: Backing card for tooltip
					const tooltip = c.append('g')
						.classed('chart-line-tooltip', true)
							// TODO: Offset based on space between "candles"
							.attr('transform', `translate(${x(d.d) + 20},${y(d.c)})`);

					const text = tooltip.append('text');

					text.append('tspan')
						.attr('x', 0)
						.attr('dy', 0)
						.text(`${formatDate(d.d)}`);
					text.append('tspan')
						.attr('x', 0)
						.attr('dy', '1em')
						.text(`Price: ${formatValue(d.c)}`);
					if (d.streams && d.streams.length > 0) {
						text.append('tspan')
							.attr('x', 0)
							.attr('dy', '1em')
							.text(`Streams: ${d.streams.length}`);
					}

					tooltip.append('rect').lower()
						.attr('x', text.node().getBBox().x - 6)
						.attr('y', text.node().getBBox().y - 6)
						.attr('height', text.node().getBBox().height + 12)
						.attr('width', text.node().getBBox().width + 12);
				})
				.on('mouseout', (e, d) => {
					d3.select('g.chart-line-tooltip').remove();
				}).on('click', (e,d) => {
					//TODO: Jump to timeline then jump using anchors???6
					// console.log(d)
					// var element =this.$els['test']
					// var top = element.offsetTop
					// window.scrollTo(0,top)
				});
				// TODO: click event to display/filter list of matching tweets?

			// Measure axis and redraw when over-sized
			let maxw = 0;
			a.select('g.chart-line-y-axis')
				.selectAll('text').each(function() {
					maxw = Math.max(maxw, this.getBBox().width - parseInt(d3.select(this).attr('x')));
				});
			a.select('g.chart-line-y-axis')
				.attr('transform', `translate(${maxw},0)`)

			// TODO: Re-adjust `.tick line` width?
			// TODO: Re-adjust x scale?

			this.$loader.stop('riversViewChartLine.update');
			console.timeEnd('riversViewChartLine.update');
		},
	},
	mounted() {
		this.$debug.enable(false);

		d3.select(this.$el).append('svg');
		this.$watch('$props.data', () => {
			this.$debug('$watch.data', this.data);
			//if (!this.$props.data) return;
			this.update();
		}, {immediate: true, deep: true});

		window.addEventListener('resize', this.update);
	},

});
</script>

<template>
	<div class='rivers-view-chart-line'>
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
	.rivers-view-chart-line {
		height: 100%;
		width: 100%;
		min-height: 250px;
	}

	.chart-line-tooltip > rect {
		fill: white;
		stroke: var(--light);
		stroke-width: 1px;
	}

	.chart-line-candle {
		stroke-width: 0;

		rect {
			fill: none;
		}

		.chart-line-stream {
			circle.chart-line-symbol {
				fill: var(--main);
				stroke: var(--main-darker);
			}
			circle.chart-line-hover {
				fill: #fff;
				stroke: none;
				opacity: 0;
			}
			text-anchor: middle;
			transform-origin: center;
		}
	}
</style>
