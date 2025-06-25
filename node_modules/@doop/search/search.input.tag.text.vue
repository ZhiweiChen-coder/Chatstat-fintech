<script lang="js" frontend>
import InputFacade from 'vue-input-facade';

app.use(InputFacade);

import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTagText').enable(true);

/**
* TODO: Docs
*/
app.component('searchInputTagText', {
	data() { return {
		rawValue: undefined,
	}},
	props: {
		value: {type: String},
		disabled: {type: Boolean, default: false},
		readonly: {type: Boolean, default: false},
		placeholder: {type: String},
		mask: {type: String}, // Text input mask to restrict to, #=Number, S=Letter, X=Alpha-numeric, A=Alpha Uppercase, a=Alpha lowercase, \=Escape
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
			$debug('encodeQuery', this.rawValue);
			this.$emit('change', this.rawValue);
		},
	},

	created() {
		this.$debug.enable(false);

		this.$watch('value', () => {
			if (!this.value) {
				this.rawValue = undefined;
				return;
			}

			this.rawValue = this.value;
		}, { immediate: true });
	},
});
</script>

<template>
	<div class="search-input-tag-text">
		<input
			class="form-control"
			type="text"
			:placeholder="placeholder"
			:disabled="disabled"
			:readonly="readonly"
			:value="this.rawValue"
			@selected="handleChange"
			:clear-button="true"
			v-facade="mask"
		/>
	</div>
</template>
