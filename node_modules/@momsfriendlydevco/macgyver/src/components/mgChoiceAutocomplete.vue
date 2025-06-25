<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgChoiceAutocomplete').enable(false);

import _ from 'lodash';

import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

app.component("v-select", VueSelect);

import ChoiceEnum from '../mixins/ChoiceEnum.js';

export default app.mgComponent("mgChoiceAutocomplete", {
	mixins: [ChoiceEnum],
	meta: {
		title: "Autocomplete",
		icon: "far fa-chevron-circle-down",
		category: "Choice Selectors",
		preferId: true,
		shorthand: ["choice", "choose", "dropdown", "pick"],
	},
	data() {
		return {
			selected: [],
		};
	},
	props: {
		title: {type: 'mgText'},
		placeholder: {
			type: "mgText",
			help: "Ghost text to display when there is no value",
		},
		required: {
			type: "mgToggle",
			default: false,
			help: "One choice must be selected",
		},
		focus: {
			type: "mgToggle",
			default: false,
			help: "Auto-focus the element when it appears on screen",
		},
	},
	created() {
		this.$debug = $debug;

		this.enumPrefetch = false; // Prevent fetching until a search query has been provided

		this.$on("mgValidate", (reply) => {
			if (this.$props.required && !this.data)
				return reply(`${this.$props.title} is required`);
		});
	},
	mounted() {
		if (this.$props.focus) {
			// NOTE: Focus selection does NOT work if DevTools is open in Chome
			this.$refs.select.searchEl.focus();
		}
	},
	methods: {
		select(option) {
			if (!option) return this.data = this.selected = null;

			this.data = this.getOptionKey(option);
			this.selected = option;
			if (option.action) this.$mgForm.run(option.action);
		},

		/**
		* Triggered when the search text changes.
		*
		* @param search {String} Current search text
		* @param loading {Function} Toggle loading class
		*/
		searchHandler(search, loading) {
			// TODO: Debounce
			loading(true);
			this.getEnum(search).then(() => loading(false));
		},

		/**
		* Populate the enumIter object
		* This function also correctly populates the selected item (or the default)
		* Each item is assumed to have the spec `{id: String, title: String, icon?: String}`
		* @param {array<Object>} enumIter The new iterable enum
		*/
		setEnum(enumIter) {
			this.enumIter = enumIter;

			if (this.data) {
				this.selected = this.findOptionByKey(this.data) || this.data;
			} else if (this.$props.default) {
				this.selected = this.findOptionByKey(this.$props.default) || this.$props.default;
			}
		},
	},
});
</script>

<template>
	<div class="mg-choice-autocomplete">
		<v-select
			:value="selected"
			label="title"
			:options="options"
			:placeholder="$props.placeholder"
			:clearable="!$props.required"
			:get-option-key="getOptionKey"
			:get-option-label="getOptionLabel"
			@search="searchHandler"
			@input="select"
		>
			<template #selected-option="option">
				<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)" />
				{{ getOptionLabel(option) }}
			</template>
			<template #option="option">
				<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)" />
				{{ getOptionLabel(option) }}
			</template>
		</v-select>
	</div>
</template>
