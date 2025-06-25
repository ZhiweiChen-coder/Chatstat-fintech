<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgChoiceButtons').enable(false);

import _ from 'lodash';
import ChoiceEnum from '../mixins/ChoiceEnum.js';

export default app.mgComponent('mgChoiceButtons', {
	mixins: [ChoiceEnum],
	meta: {
		title: 'Choice Buttons',
		icon: 'fas fa-ellipsis-h',
		category: 'Choice Selectors',
		preferId: true,
	},
	props: {
		title: {type: 'mgText'},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		classWrapper: {type: 'mgText', default: 'btn-group', title: 'Group CSS class', advanced: true}, // FIXME: Called "className" elsewhere, could simply be "class"?
		itemClassActive: {type: 'mgText', default: 'btn btn-primary', advanced: true}, // FIXME: If using radio semantics when "checked" pseudo could be used instead
		itemClassInactive: {type: 'mgText', default: 'btn btn-light', advanced: true},
	},
	created() {
		this.$on('mgValidate', reply => {
			// TODO: setCustomValidity
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		select(option) {
			if (!option) return this.data = null;

			this.data = this.getOptionKey(option);
			if (option.action) this.$mgForm.run(option.action);
		},
	},
});
</script>

<template>
	<div class="mg-choice-buttons" :class="$props.classWrapper" role="group">
		<!--
		// TODO: Possible refactor to use inbuilt radio semantics
		<div class="form-check form-check-inline">
			<div v-for="option in options" :key="getOptionKey(option)">
				<input
					type="radio"
					:name="_uid"
					:id="`${_uid}-${getOptionKey(option)}`"
					class="form-check-input"
					:class="getOptionKey(option) && data == getOptionKey(option)
						? option.classActive || option.class || $props.itemClassActive
						: option.classInactive || option.class || $props.itemClassInactive
					"
					:value="getOptionKey(option)"
					v-model="data"
				/>
				<label
					class="form-check-label"
					:for="`${_uid}-${getOptionKey(option)}`"
					>
					<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)"/>
					{{ getOptionLabel(option) }}
				</label>
			</div>
		</div>
		-->
		<a
			v-for="option in options"
			:key="getOptionKey(option)"
			:class="getOptionKey(option) && data == getOptionKey(option)
				? option.classActive || option.class || $props.itemClassActive
				: option.classInactive || option.class || $props.itemClassInactive
			"
			tabindex="0"
			v-tooltip="option.tooltip"
			@keyup.space="select(option)"
			@click="select(option)"
		>
			<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)"/>
			{{ getOptionLabel(option) }}
		</a>
	</div>
</template>

<style>
.fa-invisible:before {
	content: "\f111";
	visibility: hidden;
}
</style>
