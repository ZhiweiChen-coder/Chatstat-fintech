<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgChoiceDropdown').enable(false);

import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

import _ from 'lodash';

import ChoiceEnum from '../mixins/ChoiceEnum.js';

app.component('v-select', VueSelect);

export default app.mgComponent('mgChoiceDropdown', {
	mixins: [ChoiceEnum],
	meta: {
		title: 'Dropdown multiple-choice',
		icon: 'far fa-chevron-circle-down',
		category: 'Choice Selectors',
		preferId: true,
		shorthand: ['choice', 'choose', 'dropdown', 'pick'],
	},
	data() { return {
		selected: [],
	}},
	props: {
		title: {type: 'mgText'},
		placeholder: {type: 'mgText', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		focus: {type: 'mgToggle', default: false, help: 'Auto-focus the element when it appears on screen'},
	},
	methods: {
		select(option) {
			if (!option) return this.data = this.selected = null;

			this.data = this.getOptionKey(option);
			this.selected = option;
			if (option.action) this.$mgForm.run(option.action);
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
	created() {
		this.$debug = $debug;

		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	mounted() {
		if (this.$props.focus) {
			// NOTE: Focus selection does NOT work if DevTools is open in Chome
			this.$refs.select.searchEl.focus();
		}
	},
});
</script>

<template>
	<div class="mg-choice-dropdown">
		<v-select
			:value="selected"
			label="title"
			:options="options"
			:placeholder="$props.placeholder"
			:clearable="!$props.required"
			:get-option-key="getOptionKey"
			:get-option-label="getOptionLabel"
			@input="select($event)"
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

		<div v-if="$debug.$enabled" class="card">
			<div class="card-header">
				Raw data
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</div>
</template>

<style>
/* Make look consistant with Bootstrap */
.v-select.open .dropdown-toggle {
	border-color: #5cb3fd;
}

/* Remove weird dropdown icon that Bootstrap adds */
.v-select .dropdown-toggle::after {
	display: none;
}

/* Wider spacing for clear button */
.v-select .dropdown-toggle .vs__clear {
	margin-right: 10px;
}

/* Align dropdown icon correctly */
.v-select .open-indicator {
	margin-top: -2px;
}

.v-select .vs__selected i {
	margin-right: 5px;
}
</style>
