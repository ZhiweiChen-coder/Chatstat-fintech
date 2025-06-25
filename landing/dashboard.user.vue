<script lang="js" frontend>
app.component('userDashboard', {
	data() { return {
		riverTitleCard: 'Top searches',
		riverApiCall: '/api/global/rivers',
	}},
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
				:href="false"
			/>
		</div>
	</main>	
</template>
