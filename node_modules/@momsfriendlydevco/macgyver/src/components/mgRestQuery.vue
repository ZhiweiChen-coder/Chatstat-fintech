<script lang="js">
export default app.mgComponent('mgRestQuery', {
	meta: {
		title: 'ReST Query',
		icon: 'far fa-database',
		category: 'Data display',
	},
	props: {
		title: {type: 'mgText'},
		className: {type: 'mgText', advanced: true},
		classActive: {type: 'mgText', default: 'btn btn-primary', advanced: true},
		classInactive: {type: 'mgText', default: 'btn btn-light', advanced: true},
		iconActive: {type: 'mgIcon', default: 'fa fa-database', advanced: true},
		iconInactive: {type: 'mgIcon', default: 'far fa-plus', advanced: true},
		textActive: {type: 'mgText', default: 'Edit query', advanced: true},
		textInactive: {type: 'mgText', default: 'Add query', advanced: true},
	},
	computed: {
		codeDisplay() {
			if (!this.data) return '';
			return '<pre class="pre-sm">'
				+ JSON.stringify(this.data, null, '\t')
					.replace(/\n/g, '<br/>')
			+ '</pre>';
		},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		editQuery() {
			Promise.resolve()
				.then(res => this.$prompt.macgyver({
					title: 'Edit query',
					// buttons: [], // We assume closing the dialog resolves so no need for buttons
					form: [
						{
							id: 'query',
							type: 'mgCode',
							showTitle: false,
						},
					],
					data: {
						query: this.data,
					},
				}))
				.then(form => this.data = JSON.parse(form.query));
		},
	},
});
</script>

<template>
	<a
		@click="editQuery()"
		class="btn btn-light"
		:class="data ? [data, $props.classActive || $props.className] : [$props.classInactive || $props.className]"
		v-tooltip="{content: codeDisplay, classes: 'text-left'}"
	>
		<i :class="data ? $props.iconActive : $props.iconInactive"/>
		{{data ? $props.textActive : $props.textInactive}}
	</a>
</template>
