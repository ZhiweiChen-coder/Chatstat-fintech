<script lang="js" frontend>
// TODO: Via `app.mixin`; Doop3 allows lookup by name with `mixins: ['riversViewCommon']`?
const riversViewCommon = require('./rivers.view.common.js').default;

app.component('riversViewChart', {
	inject: ['riversViewResults'],
	mixins: [riversViewCommon],
	data() { return {
		innerMode: 'line',
		flowData: [],
		streamsData: [],
	}},
	props: {
		'platformApiCall': {type: String, default: '/api/platforms'},
		mode: {type: String, default: 'line'}, // ENUM candle, line
	},
	computed: {
		/**
		 * Compute the difference between the latest prices
		 * @returns {object} Closing price and it's change relative to the previous
		 */
		newestChange() {
			this.$debug('newestChange', this.flowData);

			if (!this.flowData || this.flowData.length < 2) return {
				close: 0,
				change: 0,
			};

			return {
				close: this.flowData[this.flowData.length - 1][1],
				change: this.flowData[this.flowData.length - 1][1] - this.flowData[this.flowData.length - 2][1],
			}
		},
	},
	mounted() {
		this.$debug.enable(false);

		this.$watch('$props.mode', () => {
			this.$data.innerMode = this.$props.mode;
		}, {immediate: true, deep: false});

		this.$watch('riversViewResults.flow', () => {
			this.$debug(
				'$watch.riversViewResults.flow', 
				this.riversViewResults.flow.platform,
				this.riversViewResults.flow.symbol,
				this.riversViewResults.river.title
			);
			this.refresh(
				this.riversViewResults.flow,
				this.riversViewResults.river,
			);
		}, {immediate: true, deep: false});
	}
});
</script>

<template>
	<div class="rivers-view-chart h-100">
		<section class="nav nav-bordered align-items-end mt-3">
			<div class="nav-item mr-auto">
				<span class="h3 mr-2">{{newestChange.close | d3Format({
					formatSpecifier: riversViewResults.formatSpecifier,
					formatLocale: riversViewResults.formatLocale,
				})}}</span>
				<span :class="{'text-success': newestChange.change > 0, 'text-warning': newestChange.change < 0, 'text-info': newestChange.change === 0}">
					<span v-if="newestChange.change > 0" class="fas fa-caret-up"></span>
					<span v-else-if="newestChange.change < 0" class="fas fa-caret-down"></span>
					<span v-else class="fas fa-caret-right"></span>
					<span v-if="riversViewResults.flow && riversViewResults.flow.symbol && riversViewResults.flow.symbol && riversViewResults.flow.symbol.length >= 3">
						{{newestChange.change | currency({ currency: riversViewResults.flow.symbol.slice(-3) })}}
						({{(newestChange.change / newestChange.close) * 100 | percent({precision: 2})}})
					</span>
				</span>
				<!-- Toolbar: filler (keeps vertical alignment) {{{ -->
				<!-- TODO: Needed? -->
				<!--div v-else class="nav nav-pills mt-1 mb-2" style="height: 23px"/-->
				<!-- }}} -->
			</div>
		</section>

		<section class="flex-grow-1">
			<div v-if="$loader.loading || flowData && flowData.length == 0" class="d-flex align-items-center justify-content-center h-100 w-100 bg-light text-muted py-3">
				<p v-if="$loader.loading" class="mb-0">
					<i class="far fa-fw fa-spinner-third fa-spin text-success"></i>
					<span class="text-muted">Loading chart</span>
				</p>
				<p v-else-if="!riversViewResults.river" class="mb-0">
					<span>Invalid River</span>
				</p>
				<!--
				<p v-else-if="flowData && flowData.length == 0" class="mb-0">
					<span>Not enougth data</span>
				</p>
				-->
			</div>
			<div v-else class="h-100">
				<!--
				<rivers-view-chart-candle v-if="mode == 'candle'" ref="child"
					:config="{
						formatValue: riversViewResults.formatSpecifier,
						formatLocale: riversViewResults.formatLocale,
					}"
					:flowData="flowData"
					:streamsData="streamsData"
					@change="refresh(
						riversViewResults.flow,
						riversViewResults.river,
						{
							oldest: $event.oldest,
							newest: $event.newest
						}
					)"
				/>
				-->
				<rivers-view-chart-line v-if="mode == 'line'"
					:config="{
						formatValue: riversViewResults.formatSpecifier,
						formatLocale: riversViewResults.formatLocale,
					}"
					:flowData="flowData"
					:streamsData="streamsData"
					:river="riversViewResults.river"
					@change="loadFlow(
						riversViewResults.flow,
						{
							oldest: $event.oldest,
							newest: $event.newest
						}
					)"
				/>
			</div>
		</section>

		<div v-if="$debug.$enable" v-permissions="'debug'" class="card">
			<div class="card-header">
				Properties
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>$props: {{$props}}</pre>
				<pre>resolutionOptions: {{resolutionOptions}}</pre>
				<pre>period: {{period}}</pre>
				<pre>resolution: {{resolution}}</pre>
				<!--
				<pre>$data: {{$data}}</pre>
				<pre>flowData: {{flowData}}</pre>
				<pre>streamsData: {{streamsData}}</pre>
				<pre>newestChange: {{newestChange}}</pre>
				-->
			</div>
		</div>
	</div>
</template>

<style>
.rivers-view-chart {
	min-height: 300px;
}
</style>