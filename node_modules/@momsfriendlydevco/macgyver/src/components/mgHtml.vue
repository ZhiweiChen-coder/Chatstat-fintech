<script lang="js">
export default app.mgComponent('mgHtml', {
	meta: {
		title: 'Static HTML',
		icon: 'fab fa-html5',
		category: 'General Decoration',
	},
	inject: {
		$mgForm: {from: '$mgForm'},
		$mgFormEditor: {from: '$mgFormEditor', default: false},
	},
	props: {
		text: {type: 'mgCode', syntax: 'html'},
	},
});
</script>

<template>
	<div>
		<div v-if="!$mgFormEditor" v-html="data || $props.text" class="form-control-static"/>
		<mg-wysiwyg
			v-if="$mgFormEditor" 
			:value="data === undefined ? $props.text : data"
			@change="data = $event"
		/>
	</div>
</template>
