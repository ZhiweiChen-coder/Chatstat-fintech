<script lang="js">
export default app.mgComponent('mgAlert', {
	meta: {
		title: 'Alert Box',
		icon: 'far fa-exclamation-triangle',
		category: 'General Decoration',
		preferId: false,
	},
	props: {
		text: {type: 'mgText', default: 'This is an alert!'},
		className: {
			type: 'mgChoiceButtons',
			default: 'alert-info',
			iconSelected: 'fa fa-fw fa-check',
			iconDefault: 'fa fa-fw',
			enum: [
				{id: 'alert alert-success', class: 'btn-success'},
				{id: 'alert alert-info', class: 'btn-info'},
				{id: 'alert alert-warning', class: 'btn-warning'},
				{id: 'alert alert-danger', class: 'btn-danger'},
			],
		},
	},
});
</script>

<template>
	<div :class="$props.className">
		{{data || $props.text}}
	</div>
</template>
