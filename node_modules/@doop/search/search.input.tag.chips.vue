<script lang="js" frontend>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTagChips').enable(false);

/**
* TODO: Docs
*/
app.component('searchInputTagChips', {
	components: {
		'v-select': vSelect
	},
	data() { return {
		rawValue: [],
		enumIter: [],
	}},
	props: {
		value: {type: String},
		disabled: {type: Boolean, default: false},
		readonly: {type: Boolean, default: false},
		placeholder: {type: String},

		enumSource: {type: String, default: 'list', enum: ['list', 'url']},
		enum: {type: Array},
		enumUrl: {type: String},
		optionKeyPath: {type: String, default: 'id'},
		optionLabelPath: {type: String, default: 'title'},

		showDropdown: {type: Boolean, default: true},
	},
	methods: {
		handleChange(e) {
			$debug('handleChange', e);
			this.rawValue = e;
			this.encodeQuery();
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			$debug('encodeQuery', this.rawValue, this.getOptionKey(this.rawValue));
			this.$emit('change', this.rawValue.map(v => this.getOptionKey(v)).join(',').trim());
		},

		/**
		 * Execute AJAX lookup based on search query
		 */
		onSearch(search, loading) {
			if (this.enumSource !== 'url' || !this.enumUrl) return;

			if (search.length) {
				loading(true);
				this.search(loading, search, this);
			}
		},

		/**
		 * Debounced search method
		 */
		search: _.debounce((loading, search, vm) => {
			vm.$http.get(vm.enumUrl, {
				params: {
					q: escape(search),
				},
			})
			.then(res => vm.enumIter = res.data)
			// TODO: catch errors and toast?
			.finally(() => loading(false));
		}, 350),


		/**
		* Retrieve option label based on path specified in properties.
		* @param {Object} option The selected option within enum
		*/
		getOptionLabel(option) {
			return _.get(option, this.$props.optionLabelPath, '');
		},


		/**
		* Retrieve option key based on path specified in properties.
		* @param {Object} option The selected option within enum
		*/
		getOptionKey(option) {
			return _.get(option, this.$props.optionKeyPath, '');
		},
	},

	created() {
		this.$watch('enum', () => {
			if (this.enumSource !== 'list') return;

			this.enumIter = this.enum;
		}, { immediate: true });

		this.$watch('value', () => {
			$debug('$watch', 'value', this.value, this.rawValue);
			if (!this.value) {
				this.rawValue = [];
				return;
			}

			this.value.split(',').forEach(v => {
				const value = /^["'\(].+["'\)]$/.test(v) ? v.slice(1, -1) : v; // Remove wrapping for combined terms

				// Check if value is already selected
				if (this.rawValue.find(o => this.getOptionKey(o) === value)) return;

				// Retrieve full value object as required
				if (this.enumSource === 'url') {
					this.$http.get(this.enumUrl, {
						params: {
							q: escape(v),
						},
					})
					.then(res => this.rawValue.push(
						res.data.find(o => this.getOptionKey(o) === value)
					));

				// Utilise pre-defined list of value objects
				} else {
					this.rawValue.push(
						this.enumIter.find(o => this.getOptionKey(o) === value)
					);
				}
			});
			$debug('rawValue', this.rawValue);
		}, { immediate: true });
	},
});
</script>

<template>
	<div class="search-input-tag-chips">
		<v-select
			class="form-control"

			:placeholder="placeholder"
			:disabled="disabled"
			:readonly="readonly"

			:clearable="true"
			:filterable="true"
			:multiple="true"
			:searchable="true"
			:taggable="false"
			:no-drop="!showDropdown"
			:close-on-select="true"

			:options="enumIter"
			:get-option-key="getOptionKey"
			:get-option-label="getOptionLabel"

			:value="this.rawValue"
			@input="handleChange"
			@search="onSearch"
		/>
	</div>
</template>

<style lang="scss">
.v-select.vs--multiple {
	height: auto;
}
</style>