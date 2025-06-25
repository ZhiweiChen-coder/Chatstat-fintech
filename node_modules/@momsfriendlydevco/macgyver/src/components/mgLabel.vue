<script lang="js">
export default app.mgComponent('mgLabel', {
	meta: {
		title: 'Read-only label',
		icon: 'far fa-font',
		category: 'General Decoration',
	},
	props: {
		text: {type: 'mgText'},
		className: {type: 'mgText', default: 'form-control-static', advanced: true},
	},
});
</script>

<template>
	<div :class="$props.className">
		{{data || $props.text}}
	</div>
</template>
