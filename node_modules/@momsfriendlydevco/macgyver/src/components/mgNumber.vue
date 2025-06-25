<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgNumber').enable(false);

import _ from 'lodash';

export default app.mgComponent('mgNumber', {
	meta: {
		title: 'Number',
		icon: 'far fa-sort-numeric-down',
		category: 'Simple Inputs',
		preferId: true,
		shorthand: ['integer', 'int', 'float', 'num'],
		format: v => {
			if (!v) return '';
			return (_.isNumber(v) ? v : parseInt(v)).toLocaleString();
		},
		formatClass: 'text-right',
	},
	props: {
		title: {type: 'mgText'},
		min: {type: 'mgNumber', title: 'Minimum value'},
		max: {type: 'mgNumber', title: 'Maximum value'},
		step: {type: 'mgNumber', title: 'Value to increment / decrement by'},
		placeholder: {type: 'mgNumber', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false},
		disabled: {type: 'mgToggle', default: false},
		readonly: {type: 'mgToggle', default: false},
		interface: {type: 'mgChoiceDropdown', title: 'Interface', help: 'How to allow number input', default: 'input', enum: [
			{id: 'bumpers', title: 'Number input with buttons'},
			{id: 'slider', title: 'Slider bar'},
			{id: 'input', title: 'Number input box only'},
		]},
		bumperDownClass: {type: 'mgText', default: 'btn btn-light fa fa-arrow-down input-group-prepend', advanced: true, showIf: 'interface == "bumpers"'},
		bumperUpClass: {type: 'mgText', default: 'btn btn-light fa fa-arrow-up input-group-append', advanced: true, showIf: 'interface == "bumpers"'},
		prefix: {type: 'mgText', title: 'Prefix', help: 'Prefix to show before the input', showIf: 'interface == "input"'},
		prefixClass: {type: 'mgText', default: 'input-group-prepend input-group-text', advanced: true, showIf: 'interface == "input"'},
		suffix: {type: 'mgText', title: 'Suffix', help: 'Suffix to show after the input', showIf: 'interface == "input"'},
		suffixClass: {type: 'mgText', default: 'input-group-append input-group-text', advanced: true, showIf: 'interface == "input"'},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
			if (this.$props.min && this.data < this.$props.min) return reply(`${this.$props.title} is too small (minimum value is ${this.$props.min})`);
			if (this.$props.max && this.data > this.$props.max) return reply(`${this.$props.title} is too large (maximum value is ${this.$props.max})`);
		});
	},
	methods: {
		add(steps) {
			if (!_.isNumber(this.data)) return this.data = this.$props.min || 0; // Not already a number default to the min or zero

			this.data += steps * (this.$props.step || 1);
			if (this.$props.max && this.data > this.$props.max) this.data = this.$props.max;
			if (this.$props.min && this.data < this.$props.min) this.data = this.$props.min;
		},
	},
});
</script>

<template>
	<div class="mg-number" :class="`mg-number-${$props.interface}`">
		<div v-if="$props.interface == 'slider'">
			<input
				v-model="data"
				type="range"
				class="form-control"
				:placeholder="$props.placeholder"
				:min="$props.min"
				:max="$props.max"
				:step="$props.step"
				:disabled="$props.disabled"
				:readonly="$props.readonly"
			/>
			<label class="mg-number-slider-value">{{(data || '?') | number}}</label>
		</div>
		<div v-else-if="$props.interface == 'bumpers'" class="input-group">
			<a @click="add(-1)" class="hidden-print" :class="$props.bumperDownClass"></a>
			<input
				v-model="data"
				type="number"
				class="form-control"
				:placeholder="$props.placeholder"
				:min="$props.min"
				:max="$props.max"
				:step="$props.step"
				:disabled="$props.disabled"
				:readonly="$props.readonly"
			/>
			<a @click="add(1)" class="hidden-print" :class="$props.bumperUpClass"></a>
		</div>
		<div v-else-if="$props.interface == 'input'" class="input-group">
			<div v-if="$props.prefix" :class="$props.prefixClass">{{$props.prefix}}</div>
			<input
				v-model="data"
				type="number"
				class="form-control"
				:placeholder="$props.placeholder"
				:min="$props.min"
				:max="$props.max"
				:step="$props.step"
				:disabled="$props.disabled"
				:readonly="$props.readonly"
			/>
			<div v-if="$props.suffix" :class="$props.suffixClass">{{$props.suffix}}</div>
		</div>
		<div v-else class="alert alert-warning">
			Unknown mgNumber interface '{{$props.interface}}'
		</div>
	</div>
</template>

<style>
.mg-number input[type=number] {
	padding: 0 10px;
}

.mg-number .btn {
	box-shadow: none;
	border: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
}

/* Hide the spin button in mgNumber controls */
.mg-number input[type=number]::-webkit-outer-spin-button,
.mg-number input[type=number]::-webkit-inner-spin-button {
	/* display: none; <- Crashes Chrome on hover */
	-webkit-appearance: none;
	margin: 0; /* <-- Apparently some margin is still there even though it's hidden */
}



/* Slider {{{ */
.mg-number.mg-number-slider input[type="range"] {
	display: inline-block;
	-webkit-appearance: none;
	width: calc(100% - (73px));
	height: 10px;
	border-radius: 5px;
	background: var(--btn-default-bg);
	outline: none;
	padding: 0;
	margin: 0;
}

.mg-number.mg-number-slider input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: var(--primary);
	cursor: pointer;
	-webkit-transition: background .15s ease-in-out;
	transition: background .15s ease-in-out;
}

.mg-number.mg-number-slider input[type="range"]::-webkit-slider-thumb:hover,
.mg-number.mg-number-slider input[type="range"]:active::-webkit-slider-thumb,
.mg-number.mg-number-slider input[type="range"]::-moz-range-thumb:hover,
.mg-number.mg-number-slider input[type="range"]:active::-moz-range-thumb {
	background: var(--primary);
}

.mg-number.mg-number-slider input[type="range"]::-moz-range-thumb {
	width: 20px;
	height: 20px;
	border: 0;
	border-radius: 50%;
	color: var(--btn-default-fg);
	background: var(--btn-default-bg);
	cursor: pointer;
	-moz-transition: background .15s ease-in-out;
	transition: background .15s ease-in-out;
}

.mg-number.mg-number-slider input[type="range"]:focus::-webkit-slider-thumb {
	box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--primary);
}

.mg-number.mg-number-slider .mg-number-slider-value {
	display: inline-block;
	position: relative;
	width: 60px;
	line-height: 20px;
	text-align: center;
	border-radius: 3px;
	color: var(--btn-default-fg);
	background: var(--btn-default-bg);
	padding: 5px 10px;
	margin-left: 8px;
}
.mg-number.mg-number-slider .mg-number-slider-value:after {
	position: absolute;
	top: 8px;
	left: -7px;
	width: 0;
	height: 0;
	border-top: 7px solid transparent;
	border-right: 7px solid var(--btn-default-bg);
	border-bottom: 7px solid transparent;
	content: '';
}

::-moz-range-track {
	background: var(--btn-default-bg);
	border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer {
	border: 0;
}
/* }}} */
</style>
