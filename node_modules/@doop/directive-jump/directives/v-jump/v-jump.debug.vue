<script lang="js" frontend>
app.component({
	route: '/debug/v-jump',
});
</script>

<template>
	<div>
		<div class="btn-group-float">
			<a v-href="'#top'" class="btn btn-icon btn-circle btn-light fas fa-chevron-up" v-tooltip="'Jump to top'"/>
		</div>
		<div class="card" v-jump="'top'">
			<div class="card-header">v-jump</div>
			<div class="list-group">
				<a v-href="'#item-10'" class="list-group-item">Jump to 10</a>
				<a v-href="'#item-50'" class="list-group-item">Jump to 50</a>
				<a v-href="'#item-99'" class="list-group-item">Jump to 99</a>
				<a v-href="'#item-remove'" class="list-group-item">Jump to 101 (remove after nav)</a>
				<a v-href="'#flash-card'" class="list-group-item">Jump card w/flash</a>
			</div>
		</div>
		<div class="mt-4">
			<div class="list-group">
				<div v-for="number in 100" class="list-group-item" v-jump="`item-${number}`">
					Item {{number}}
				</div>
				<div class="list-group-item" v-jump.remove="'item-remove'">
					Item 101 (remove after nav)
				</div>
			</div>
		</div>

		<div class="card mt-4" v-jump="'flash-card'">
			<div class="card-header">v-jump card with flash</div>
			<div class="card-body">
				Hello World
			</div>
		</div>
	</div>
</template>
