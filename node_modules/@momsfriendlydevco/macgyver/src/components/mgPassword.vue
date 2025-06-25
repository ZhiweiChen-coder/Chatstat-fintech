<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgPassword').enable(false);

import _ from 'lodash';
import InputFacade from 'vue-input-facade';

app.use(InputFacade);

export default app.mgComponent('mgPassword', {
	meta: {
		title: 'Password',
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
				{id: 'new-password', title: 'New password'},
				{id: 'current-password', title: 'Current password'},
			],
		},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
			if (this.$props.lengthMin && _.isString(this.data) && this.data.length < this.$props.lengthMin) return reply(`${this.$props.title} is too small (minimum length is ${this.$props.lengthMin})`);
			if (this.$props.lengthMax && _.isString(this.data) && this.data.length > this.$props.lengthMax) return reply(`${this.$props.title} is too long (maximum length is ${this.$props.lengthMax})`);
		});
	},
	mounted() {
		if (this.$props.focus) {
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
	<div class="mg-password">
		<input
			v-model="data"
			type="password"
			class="form-control"
			:autocomplete="$props.autoComplete"
			:placeholder="$props.placeholder"
			v-facade="$props.mask"
		/>
	</div>
</template>
