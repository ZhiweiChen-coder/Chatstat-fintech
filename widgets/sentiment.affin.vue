<script lang="js" frontend>
/**
* Simple component to parse and display sentiment
* @param {number} [sentiment] The sentiment floating value to display, if omitted a simple "Not yet available" is displayed
*/
app.component('sentimentAffin', {
	props: {
		sentiment: {type: Number},
	},
});
</script>

<template>
	<div>
		<div v-if="sentiment !== undefined">
			<div v-if="sentiment > 0" class="badge badge-success">
				<i class="far fa-plus"/>
				{{sentiment * 100 | percent({precision: 2})}}
				positive
			</div>
			<div v-else-if="sentiment < 0" class="badge badge-danger">
				<i class="far fa-minus"/>
				{{sentiment * 100 | percent({precision: 2})}}
				negative
			</div>
			<div v-else class="badge badge-light">
				Neutral
			</div>
		</div>
		<div v-else class="text-muted">
			Not yet available
		</div>
	</div>
</template>
