<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgText').enable(false);

import _ from 'lodash';
import InputFacade from 'vue-input-facade';

app.use(InputFacade);

export default app.mgComponent('mgText', {
	meta: {
		title: 'Text',
		icon: 'far fa-edit',
		category: 'Simple Inputs',
		preferId: true,
		format: true,
		shorthand: ['string', 'str'],
	},
	props: {
		title: {type: 'mgText'},
		lengthMin: {type: 'mgNumber', title: 'Minimum Length', min: 0},
		lengthMax: {type: 'mgNumber', title: 'Maximum Length'},
		placeholder: {type: 'mgText', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false},
		disabled: {type: 'mgToggle', default: false},
		readonly: {type: 'mgToggle', default: false},
		mask: {type: 'mgText', help: 'Text input mask to restrict to, #=Number, S=Letter, X=Alpha-numeric, A=Alpha Uppercase, a=Alpha lowercase, \=Escape'},
		focus: {type: 'mgToggle', default: false, help: 'Auto-focus the element when it appears on screen'},
		autoComplete: {
			type: 'mgChoiceDropdown',
			help: 'Allow auto-complete value propagation',
			default: 'off',
			advanced: true,
			enum: [
				{id: 'off', title: 'Disabled'},
				{id: 'on', title: 'Automatic'},
				{id: 'name', title: 'Name'},
				{id: 'email', title: 'Email'},
				{id: 'username', title: 'Username'},
				{id: 'street-address', title: 'Street address'},
				{id: 'address-line1', title: 'Address line 1'},
				{id: 'address-line2', title: 'Address line 2'},
				{id: 'address-line3', title: 'Address line 3'},
				{id: 'address-level1', title: 'Address level 1'},
				{id: 'address-level2', title: 'Address level 2'},
				{id: 'address-level3', title: 'Address level 3'},
				{id: 'address-level4', title: 'Address level 4'},
				{id: 'country', title: 'Country code'},
				{id: 'country-name', title: 'Country name'},
				{id: 'postal-code', title: 'Postcode'},
			],
		},
		enum: {
			type: 'mgTable',
			title: 'Suggested items',
			items: [
				{id: 'title', type: 'mgText', required: true},
			],
		},
	},
	computed: {
		datalist() { // Map $props.enum into a collection of the form {id, title}
			if (!this.$props.enum || !this.$props.enum.length) return;
			return this.$props.enum.map(i => {
				if (_.isString(i)) return {id: i, title: i};
				return i;
			});
		},
	},
	created() {
		this.$on('mgValidate', reply => {
			// TODO: setCustomValidity
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
			if (this.$props.lengthMin && _.isString(this.data) && this.data.length < this.$props.lengthMin) return reply(`${this.$props.title} is too small (minimum length is ${this.$props.lengthMin})`);
			if (this.$props.lengthMax && _.isString(this.data) && this.data.length > this.$props.lengthMax) return reply(`${this.$props.title} is too long (maximum length is ${this.$props.lengthMax})`);
		});
	},
	mounted() {
		if (this.$props.focus) {
			// FIXME: jQuery not defined? Only in build:dev mode?
			var $el = $(this.$el);
			var focusVisible = ()=> {
				if ($el.is(':visible')) {
					$el.focus();
				} else {
					setTimeout(focusVisible, 100);
				}
			};
			focusVisible();
		}
	},
});
</script>

<template>
	<div class="mg-text">
		<input
			type="text"
			class="form-control"
			:value="data"
			:autocomplete="$props.autoComplete"
			:placeholder="$props.placeholder"
			:disabled="$props.disabled"
			:readonly="$props.readonly"
			:list="datalist ? `mg-text-datalist-${_uid}` : undefined"
			v-facade="$props.mask"
			@input="data = $event.target.value"
		/>
		<datalist v-if="datalist" :id="`mg-text-datalist-${_uid}`">
			<option v-for="item in datalist" :value="item.title" :key="item.id">
				{{item.title}}
			</option>
		</datalist>
	</div>
</template>
