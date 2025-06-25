<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgChoicePopup').enable(false);

import _ from 'lodash';

// TODO: Integrate ChoiceEnum mixin

export default app.mgComponent('mgChoicePopup', {
	meta: {
		title: 'Choice Popup',
		icon: 'fas fa-window-maximize',
		category: 'Choice Selectors',
		preferId: true,
	},
	data() { return {
		activeTitle: undefined,
		enumIter: [],
	}},
	props: {
		title: {type: 'mgText'},
		enum: {
			type: 'mgTable',
			title: 'List items',
			items: [
				{id: 'id', title: 'ID'},
				{id: 'title', title: 'Title'},
				{id: 'class', title: 'Classes'},
				{id: 'classActive', title: 'Active Class'},
				{id: 'classInactive', title: 'Inactive Class'},
			],
		},
		// TODO: Support for "enumSource"/"enumUrl"
		optionsPath: {
			type: "mgText",
			default: "",
			help: "Path within data feed for options array",
		},
		optionKeyPath: {
			type: "mgText",
			default: "id",
			help: "Path within data feed for options key",
		},
		optionLabelPath: {
			type: "mgText",
			default: "title",
			help: "Path within data feed for options label",
		},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		popupTitle: {type: 'mgText', default: 'Select item', advanced: true},
		inactiveText: {type: 'mgText', default: 'Select item...', advanced: true},
		iconActive: {type: 'mgIcon', default: 'far fa-check', advanced: true},
		iconInactive: {type: 'mgIcon', default: 'far fa-ellipsis-h', advanced: true},
		classActive: {type: 'mgText', default: 'btn btn-primary', advanced: true},
		classInactive: {type: 'mgText', default: 'btn btn-default', advanced: true},
	},
	computed: {
		options() {
			return _.get(this.enumIter, this.$props.optionsPath, this.enumIter);
		},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		showModal() {
			this.$prompt.macgyver({
				title: this.$props.popupTitle,
				form: {
					id: 'selected',
					type: 'mgChoiceButtons',
					enum: this.options,
					optionsPath: this.optionsPath,
					optionKeyPath: this.optionKeyPath,
					optionLabelPath: this.optionLabelPath,
					classWrapper: 'list-group',
					itemClassActive: 'list-group-item active',
					itemClassInactive: 'list-group-item',
				},
				data: {
					selected: this.data,
				},
				buttons: [],
				onShow: ()=> {
					// Bind to the mg-form element, detect the first change and close the dialog
					this.$macgyver.$forms.promptMacGyver.$on('mgChange', ()=> setTimeout(()=> { // Timeout not really needed but it lets the button highlight before we close
						this.$prompt.$settings.$defer.resolve(this.$prompt.$settings.data);
						this.$prompt.close(true)
					}, 100));
				},
			})
				.then(form => this.$set(this, 'data', form.selected))
		},
	},
	watch: {
		data() {
			if (this.data && this.enumIter.length) {
				var activeItem = this.enumIter.find(e => e.id == this.data);
				this.$set(this, 'activeTitle', activeItem ? activeItem.title : '');
			}
		},
		'$props.enumUrl': {
			immediate: true,
			handler() {
				if (!this.$props.enumUrl) return;
				this.$macgyver.utils.fetch(this.$props.enumUrl, {
					type: 'array',
					mappings: {
						id: {required: true},
						title: {required: true},
					},
				})
					.tap(data => console.log('mgPopup got feed', data))
					.then(data => this.$set(this.$props, 'enum', data))
			},
		},
		'$props.enum': {
			immediate: true,
			handler() {
				// FIXME: Could check `.every` for strings
				if (_.isArray(this.$props.enum) && _.isString(this.$props.enum[0])) { // Array of strings
					this.enumIter = this.$props.enum.map(i => ({id: _.camelCase(i), title: i}));
				} else if (_.isArray(this.$props.enum) && _.isObject(this.$props.enum[0])) { // Collection
					this.enumIter = this.$props.enum;
				}
			},
		},
	},
});
</script>

<template>
	<div class="mg-choice-popup">
		<a
			:class="data ? $props.classActive : $props.classInactive"
			@click="showModal()"
		>
			<i :class="data ? $props.iconActive : $props.iconInactive"></i>
			{{this.data ? activeTitle : $props.inactiveText}}
		</a>
	</div>
</template>
