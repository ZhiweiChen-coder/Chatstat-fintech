<script lang="js">
export default app.mgComponent('mgIcon', {
	meta: {
		title: 'Icon',
		icon: 'far fa-flag',
		category: 'Simple Inputs',
		preferId: true,
	},
	props: {
		title: {type: 'mgText'},
		iconFallback: {type: 'mgIcon', default: 'far fa-info', help: 'The icon to use if none is selected'},
		required: {type: 'mgToggle', default: false},
		interface: {type: 'mgChoiceButtons', default: 'modal', enum: ['modal', 'dropdown']},
		iconFeed: {type: 'mgText', default: '/api/webfonts/fa.json', advanced: true, help: 'The data source to import icon information', relative: true},
		className: {type: 'mgText', default: 'btn btn-light btn-circle', advanced: true},
		classActive: {type: 'mgText', advanced: true},
		classInactive: {type: 'mgText', advanced: true},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		selectIcon() {
			Promise.resolve()
				.then(()=> this.$macgyver.notify.loading(this._uid, true))
				.then(()=> this.$http.get(this.$props.iconFeed))
				.then(res => { this.$macgyver.notify.loading(this._uid, false); return res })
				.then(res => this.$macgyver.$prompt.macgyver({
					title: 'Select icon',
					buttons: [], // We're capturing the first click so we don't need confirm buttons
					macgyver: [
						{
							id: 'className',
							type: 'mgChoiceButtons',
							showTitle: false,
							classWrapper: '',
							enum: res.data.map(icon => ({
								id: icon.class,
								class: `btn btn-icon-fixed ${icon.class} fa-fw`,
								classActive: `btn btn-primary btn-icon-fixed ${icon.class} fa-fw`,
							})),
						},
					],
					onShow: ()=> {
						// Bind to the mg-form element, detect the first change and close the dialog
						this.$macgyver.$prompt.settings.macgyverForm.$on('mgChange', ()=> setTimeout(()=> { // Timeout not really needed but it lets the button highlight before we close
							this.$macgyver.$prompt.close(true, this.$macgyver.$prompt.settings.value);
						}, 100));
					},
				}))
				.then(form => this.data = form.className)
		},
	},
});
</script>

<template>
	<div class="mg-icon">
		<a
			v-if="$props.interface == 'modal'"
			@click="selectIcon()"
			class="btn btn-light btn-icon-fixed"
			:class="data ? [data, $props.classActive || $props.className] : [$props.iconFallback, $props.classInactive || $props.className]"
		/>
		<mg-choice-dropdown
			v-if="$props.interface == 'dropdown'"
			enum-source="url"
			:enum-url="{
				url: $props.iconFeed,
				type: 'array',
				mappings: {
					id: {required: true, from: 'class'},
					title: {required: true, from: 'id'},
					icon: {required: true, from: 'class'},
				},
			}"
			:default="$props.default"
			:required="$props.required"
			:value="data"
			@change="data = $event"
		/>
		<mg-error
			v-if="$props.interface !== 'modal' && $props.interface !== 'dropdown'"
			error-text="Unknown mgIcon interface"
		/>
	</div>
</template>

<style>
.btn.btn-icon-fixed {
	box-shadow: none;
	width: 32px;
	height: 32px;
	padding: 7px 0;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
