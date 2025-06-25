<script lang="js" frontend>
app.component('riversViewResults', {
	provide() { return {
		riversViewResults: this,
	}},
	data() { return {
		innerMode: 'timeline',
	}},
	props: {
		'platformApiCall': {type: String, default: '/api/platforms'},
		mode: {type: String, default: 'timeline'}, // ENUM chart, timeline
		href: {type: Boolean, default: true},
		flow: {type: Object},
		river: {type: Object},
	},
	computed: {
		/**
		 * Compute the display format for given base pair
		 * @link https://github.com/d3/d3-format#formatSpecifier
		 * @returns {object} FormatSpecifier for D3
		 */
		formatSpecifier() {
			if (!this.flow?.symbol) return;
			switch (this.flow.symbol.slice(-3)) {
				case 'AUD':
				case 'EUR':
				case 'EUT':
				case 'GBP':
				case 'JPY':
				case 'USD':
				case 'UST':
					return {
						fill: ' ',
						align: '>',
						sign: '-',
						symbol: '$',
						zero: false,
						width: undefined,
						comma: true,
						precision: 2,
						trim: true, // FIXME: Works to trim insignificant zeros, but "0.19", "0.2", "0.21"
						type: 'f'
					};
				case 'BTC':
				case 'ETH':
				default:
					return {
						fill: ' ',
						align: '>',
						sign: '-',
						symbol: '$',
						zero: false,
						width: undefined,
						comma: false,
						precision: undefined,
						trim: false,
						type: 'f'
					};
			}
		},
		/**
		 * Compute the currency locale for given base pair
		 * @link https://github.com/d3/d3-format#formatLocale
		 * @returns {object} FormatSpecifier for D3
		 */
		formatLocale() {
			if (!this.flow?.symbol) return;
			// TODO: Support for 4 digit base pairs
			switch (this.flow.symbol.slice(-3)) {
				case 'BTC':
					return {
						decimal: '.',
						thousands: '',
						grouping: [],
						currency: ['', '₿'],
					};
				case 'ETH':
					return {
						decimal: '.',
						thousands: '',
						grouping: [],
						currency: ['', 'Ξ'],
					};
				case 'EUR':
				case 'EUT':
					return {
						decimal: '.',
						thousands: ',',
						grouping: [3],
						currency: ['€', ''],
					};
				case 'AUD':
				case 'USD':
				case 'UST':
					return {
						decimal: '.',
						thousands: ',',
						grouping: [3],
						currency: ['$', ''],
					};
				case 'GBP':
					return {
						decimal: '.',
						thousands: ',',
						grouping: [3],
						currency: ['£', ''],
					};
				case 'JPY':
					return {
						decimal: '.',
						thousands: ',',
						grouping: [3],
						currency: ['', '¥'],
					};
				default:
					return {
						decimal: '.',
						thousands: '',
						grouping: [],
						currency: ['', ''],
					};
			}
		},
	},
	mounted() {
		this.$debug.enable(false);

		this.$watch('$props.mode', () => {
			this.$data.innerMode = this.$props.mode;
		}, {immediate: true, deep: false});
	},
});
</script>

<template>
	<div class="rivers-view-results d-flex flex-column flex-grow-1">
		<section class="nav nav-tabs nav-bordered align-items-start">
			<!-- Tab / mode switches {{{ -->
			<div v-if="href" class="nav-item d-inline-flex">
				<a class="nav-link mr-1 nowrap"
					:class="{ active: this.innerMode == 'chart' }"
					:href="`/rivers/${river._id}/chart`">Chart
					<!--span v-if="isStatic" class="fas fa-sm fa-info-circle text-secondary" v-tooltip.right="'View when your influencer made a post containing your Keywords and its effect on the market'"></span-->
				</a>

				<a class="nav-link nowrap"
					:class="{ active: this.innerMode == 'timeline' }"
					:href="`/rivers/${river._id}/timeline`">Timeline
					<!--span v-if="isStatic" class="fas fa-sm fa-info-circle text-secondary" v-tooltip.right="'View the post content and market data for each post your influencer made containing your Keywords'"></span-->
				</a>
			</div>
			<div v-if="!href" class="nav-item" style="display: inline-flex">
				<a class="nav-link mr-1"
					:class="{ active: this.innerMode == 'chart' }"
					@click="innerMode = 'chart'">Chart
					<!--span v-if="isStatic" class="fas fa-sm fa-info-circle text-secondary" v-tooltip.right="'View when your influencer made a post containing your Keywords and its effect on the market'"></span-->
				</a>
				<a class="nav-link"
					:class="{ active: this.innerMode == 'timeline' }"
					@click="innerMode = 'timeline'">Timeline
					<!--span v-if="isStatic" class="fas fa-sm fa-info-circle text-secondary" v-tooltip.right="'View the post content and market data for each post your influencer made containing your Keywords'"></span-->
				</a>
			</div>
			<!-- }}} -->
		</section>

		<div class="h-100">
			<rivers-view-chart
				v-if="innerMode == 'chart'"
				:platformApiCall="platformApiCall"
			/>

			<rivers-view-timeline
				v-if="innerMode == 'timeline'"
				:platformApiCall="platformApiCall"
			/>
		</div>

		<div v-if="$debug.$enable" v-permissions="'debug'" class="card">
			<div class="card-header">
				Properties
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$props}}</pre>
			</div>
		</div>
	</div>
</template>
