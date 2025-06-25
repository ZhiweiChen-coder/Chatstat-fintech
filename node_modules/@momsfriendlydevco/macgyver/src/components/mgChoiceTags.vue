<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgChoiceTags').enable(true);

import _ from 'lodash';

import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

import ChoiceEnum from '../mixins/ChoiceEnum.js';

app.component('v-select', VueSelect);

/**
* NOTE: Toggling deselection from the menu is not yet supported until
*       https://github.com/sagalbot/vue-select/pull/877
*       Has been merged
*       - MC 2020-01-10
*/
export default app.mgComponent('mgChoiceTags', {
	mixins: [ChoiceEnum],
	meta: {
		title: 'Dropdown multiple-choice',
		icon: 'far fa-tags',
		category: 'Choice Selectors',
		preferId: true,
	},
	data() { return {
		selected: [],
	}},
	props: {
		title: {type: 'mgText'},
		placeholder: {type: 'mgText', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		allowCreate: {type: 'mgToggle', default: false, help: 'Allow the user to create their own tags in addition to the supplied ones'},
		showDropdown: {type: 'mgToggle', default: true, help: 'When clicking, show a dropdown box. Disabling will only allow the user to use existing tags'},
		maxVisible: {type: 'mgNumber', default: 0, help: 'Maximum number of tags to display before showing helper text, set to zero to disable'},
	},
	methods: {
		select(options) {
			this.$debug('select', options);
			if (!options) return this.data = this.selected = null;

			this.data = options.map(option => this.getOptionKey(option));
			this.selected = options;
			//if (option.action) this.$mgForm.run(option.action);
		},


		/**
		* Populate the enumIter object
		* This function also correctly populates the selected item (or the default)
		* Each item is assumed to have the spec `{id: String, title: String, icon?: String}`
		* @param {array<Object>} enumIter The new iterable enum
		*/
		setEnum(enumIter) {
			this.enumIter = enumIter;
			/*
			// NOTE: Full option is saved in "selected" so v-select understands which to match
			if (this.data) {
				this.selected = this.data;
			} else if (this.$props.default) {
				this.selected = this.$props.default;
			}
			*/
		},
	},
	created() {
		this.$debug = $debug;

		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data || !this.data.length) return reply(`${this.$props.title} is required`);
		});

		if (!_.isArray(this.data)) this.data = [];
	},
	// FIXME: This can be moved into "created" if ChoiceEnum mixin is a factory pattern
	mounted() {
		this.selected = this.data.map(d => this.findOptionByKey(d));
		this.$debug('selected', this.selected);
	},
});
</script>

<template>
	<div class="mg-choice-tags">
		<v-select
			:value="selected"
			label="title"
			:options="options"
			:placeholder="$props.placeholder"
			:taggable="$props.allowCreate"
			:no-drop="!$props.showDropdown"
			:close-on-select="false"
			:multiple="true"
			:get-option-key="getOptionKey"
			:get-option-label="getOptionLabel"
			@input="select($event)"
		>
			<template #option="option">
				<i
					class="far fa-fw"
					:class="selected.some(v => getOptionKey(v) == getOptionKey(option)) ? 'fa-check' : ''"
					:data-id="getOptionKey(option)"
				/>
				<!-- TODO: getOptionIcon(option)? -->
				{{ getOptionLabel(option) }}
			</template>
			<template #selected-option-container="props">
				<span v-if="!$props.maxVisible || selected.length - 1 < $props.maxVisible" class="vs__selected">
					{{ getOptionLabel(props.option) }}
					<i @click="props.deselect(props.option)" class="far fa-times ml-1 clickable"/>
				</span>
				<!-- Render only the first selected element - skip the rest -->
				<span v-else-if="getOptionKey(props.option) == getOptionKey(selected[0])" class="vs__selected_overflow">
					{{selected.length}} items selected
				</span>
				<!-- Not sure why Vue needs an empty element but if its not here it falls back to the v-select render -->
				<span v-else/>
			</template>
		</v-select>
	</div>
</template>

<style>
.mg-choice-tags.v-select .vs__selected > i {
	cursor: pointer;
}

.mg-choice-tags.v-select .vs__selected_overflow {
	margin: 2px 10px;
}
</style>
