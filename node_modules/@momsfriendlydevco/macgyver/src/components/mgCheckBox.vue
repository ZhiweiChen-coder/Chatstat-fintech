<script lang="js">
export default app.mgComponent('mgCheckBox', {
	meta: {
		title: 'Check Box',
		icon: 'far fa-check-square',
		category: 'Simple Inputs',
		preferId: true,
		format: v => v ? 'Yes' : 'No',
		formatClass: 'text-center',
	},
	props: {
		text: {type: 'mgText'},
	},
});
</script>

<template>
	<div class="text-center">
		<label>
			<input v-model="data" type="checkbox"/>
			<span>{{$props.text}}</span>
		</label>
	</div>
</template>
