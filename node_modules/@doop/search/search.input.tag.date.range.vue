<script lang="js" frontend>
// NOTE: Date components included with @doop/dates
//import Datepicker from 'vuejs-datepicker';

import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTagDateRange').enable(true);

/**
* TODO: Docs
*/
app.component('searchInputTagDateRange', {
	//components: {
	//	'date-picker': Datepicker
	//},
	data() { return {
		rawValue: {
			start: undefined,
			finish: undefined,
		},
	}},
	props: {
		value: {type: String},
		dateFormat: {type: String, default: 'DD/MM/YYYY'},
		disabled: {type: Boolean, default: false},
		placeholder: {type: String},
		seperator: {type: String, default: '-'},
	},
	methods: {
		handleChange(path, e) {
			$debug('handleChange', path, e);
			this.$setPath(this.rawValue, path, e);
			this.encodeQuery();
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			$debug('encodeQuery', 'input', this.rawValue);

			const start = moment(this.rawValue.start).format(this.dateFormat);
			const finish = moment(this.rawValue.finish).format(this.dateFormat);

			// Special dataRange default output function
			const out = _.isEmpty(this.rawValue) ? null // Uninitalized dates
			: !moment(start).isValid() && !moment(finish).isValid() ? null // No dates
			: moment(start).isValid() && moment(finish).isValid() ? // Has both start + end
					start
					+ this.seperator
					+ finish
			: moment(start).isValid() ? // Only has start
					start
					+ this.seperator
			: moment(finish).isValid() ? // Only has end
					this.seperator
					+ finish
			: null; // All other cases
			$debug('encodeQuery', 'output', out);

			if (out) this.$emit('change', out);
		},
	},

	created() {
		this.$debug.enable(false);

		this.$watch('value', () => {
			if (!this.value) {
				this.rawValue.start = undefined;
				this.rawValue.finish = undefined;
				return;
			}

			const values = this.value.split(this.seperator);
			this.rawValue.start = values[0];
			this.rawValue.finish = values[1];

			$debug('$watch', 'value', this.value, this.rawValue);
		}, { immediate: true });
	},
});
</script>

<template>
	<div class="search-input-tag-date-range row">
		<div class="col-5">
			<date-picker
				:bootstrap-styling="false"
				wrapper-class="form-control"
				:clear-button="true"
				:disabled="disabled"
				:placeholder="placeholder"
				:value="this.rawValue.start"
				@selected="handleChange('start', $event)"
			/>
		</div>
		<div class="col-2 text-center">to</div>
		<div class="col-5">
			<date-picker
				:bootstrap-styling="false"
				wrapper-class="form-control"
				:clear-button="true"
				:disabled="disabled"
				:placeholder="placeholder"
				:value="this.rawValue.finish"
				@selected="handleChange('finish', $event)"
			/>
		</div>
	</div>
</template>
