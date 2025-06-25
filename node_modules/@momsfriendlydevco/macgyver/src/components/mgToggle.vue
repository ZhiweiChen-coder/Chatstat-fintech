<script lang="js">
import {ToggleButton} from 'vue-js-toggle-button';
app.component('v-toggle', ToggleButton);

export default app.mgComponent('mgToggle', {
	meta: {
		title: 'Toggle Switch',
		icon: 'far fa-toggle-on',
		category: 'Simple Inputs',
		preferId: true,
		format: (v, config) => v ? config.onText : config.offText,
		formatClass: 'text-center',
		shorthand: ['boolean', 'switch', 'toggle'],
	},
	props: {
		onText: {type: 'mgText', default: 'on'},
		onColor: {type: 'mgColor', default: '#75c791', advanced: true},
		offText: {type: 'mgText', default: 'off'},
		offColor: {type: 'mgColor', default: '#bfcbd9', advanced: true},
		switchColor: {type: 'mgColor', default: '#fff', advanced: true},
		disabledColor: {type: 'mgColor', default: '#cccccc', advanced: true},
	},
	methods: {
		changeHandler(e) {
			this.$mgForm.$emit('mgChange', {path: this.$props.$dataPath, value: e.value});
		},
	},
});
</script>

<template>
	<v-toggle
		class="mg-toggle"
		:value="data"
		:color="{checked: $props.onColor, unchecked: $props.offColor, disabled: $props.disabledColor}"
		:labels="{checked: $props.onText, unchecked: $props.offText}"
		:switchColor="$props.switchColor"
		@change="changeHandler"
	/>
</template>

<style>
.mg-toggle {
	margin-top: 7px;
}
</style>
