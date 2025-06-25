<script lang="js" frontend>
app.component({
	route: '/rivers/:id?/:mode?',
		data() { return {
		riverTitleCard: 'User searches',
		riverApiCall: '/api/rivers',
	}},
	computed: {
		/**
		* Return the view mode to use
		* Tries to use vm.$route.params.mode if its valid or falls back to a logical value
		* @returns {string} ENUM of 'chart', 'timeline'
		*/
		mode() {
			return ['chart', 'timeline'].includes(this.$route.params.mode)
				? this.$route.params.mode
				: 'timeline';
		},

		// TODO: chartMode, ENUM: 'candle', 'line'
	},
	created() {
		this.$debug().enable(false);
	}
});
</script>


<template>
	<main class="d-flex flex-column h-100 py-3">
		<!-- FAB buttons {{{ -->
		<div class="pb-3">
			<a v-href="'/rivers/edit/new'" class="btn btn-success" v-tooltip="'Create new River to watch'">
				<i class="far fa-plus"></i> Create new Chart
			</a>
		</div>
		<!-- }}} -->
		<div class="flex-grow-1 overflow-auto">
			<rivers-widget
				:riverApiCall="riverApiCall"
				:riverTitleCard="riverTitleCard"
				:mode="mode"
				:id="$route.params.id"
			/>
		</div>
	</main>
</template>
