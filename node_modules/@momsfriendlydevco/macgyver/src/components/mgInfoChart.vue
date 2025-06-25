<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgInfoChart').enable(false);

import _ from 'lodash';
import Chart from 'chartjs';
import 'chartjs-plugin-colorschemes/dist/chartjs-plugin-colorschemes.js';

export default app.mgComponent('mgInfoChart', {
	meta: {
		title: 'Info Chart',
		icon: 'far fa-chart-bar',
		category: 'Data display',
	},
	data() { return {
		chart: undefined, // Chart.js object
	}},
	props: {
		url: {type: 'mgUrl', help: 'Where to retrieve the chart configuration object', relative: true, default: '/api/datafeeds/samples/line-chart.json'},
		colorScheme: {type: 'mgText', default: 'tableau.Classic10', help: 'Color swatch to use, see https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html for the full list', advanced: true},
		height: {type: 'mgText', advanced: true, default: '100%', advanced: true},
		width: {type: 'mgText', advanced: true, default: '100%', advanced: true},
	},
	mounted() {
		this.$watch('$props.url', ()=> {
			if (!this.$props.url) return;
			this.$macgyver.utils.fetch(this.$props.url)
				.then(data => this.chart = new Chart(this.$el.children[0].getContext('2d'), _.merge(data, this.chartBase)))
		}, {immediate: true});

	},
	computed: {
		chartBase() { // Config overrides for the chart
			return {
				options: {
					maintainAspectRatio: false, // Let the container determine the chart size
					plugins: {
						colorschemes: {
							scheme: this.$props.colorScheme,
						},
					},
				},
			};
		},
	},
});
</script>

<template>
	<div class="mg-info-chart" :style="{height: $props.height, width: $props.width}">
		<canvas/>
	</div>
</template>

<style>
/* Hack to make the chart.js element resize. See - https://www.chartjs.org/docs/latest/general/responsive.html#important-note */
.mg-info-chart {
	position: relative;
	margin: auto;
}
</style>
