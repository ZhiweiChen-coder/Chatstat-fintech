<script lang="js">
export default app.mgComponent('mgUrl', {
	meta: {
		title: 'URL',
		icon: 'far fa-globe',
		category: 'Simple Inputs',
		preferId: true,
		format: v => {
			if (!v) return '';
			return `<a href="${v}" target="_blank">${v}</a>`;
		},
		shorthand: ['uri'],
	},
	props: {
		title: {type: 'mgText'},
		placeholder: {type: 'mgUrl', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false},
		relative: {type: 'mgToggle', help: 'Allow relative URL paths to the host'}, // FIXME: Not yet implemented
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
});
</script>

<template>
	<input v-model="data" type="url" class="form-control" :placeholder="$props.placeholder"/>
</template>
