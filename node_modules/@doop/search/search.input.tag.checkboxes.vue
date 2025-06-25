<script lang="js" frontend>
import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTagCheckboxes').enable(true);

/**
* TODO: Docs
*/
app.component('searchInputTagCheckboxes', {
	data() { return {
		rawValue: {},
	}},
	props: {
		value: {type: String},
		options: {type: Array},
	},
	methods: {
		setOption(id, checked) {
			$debug('setOption', this.rawValue, id, checked);
			this.$setPath(this.rawValue, id, checked);
			this.encodeQuery();
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			$debug('encodeQuery', this.rawValue);

			const values = _(this.rawValue)
				.pickBy() // Choose only truthy values
				.keys()
				.value();

			this.$emit('change', values.length ? values.join(',') : '');
		},
	},

	created() {
		this.$debug.enable(false);

		this.$watch('value', () => {
			if (!this.value) {
				this.rawValue = {};
				return;
			}

			const setValues = new Set(this.value
				.replace(/\"/g, '') // Remove quotes to match options
				.split(/\s*,\s*/)
				.filter(Boolean)
			);
			this.rawValue = _(this.options)
				.mapKeys(option => option.id)
				.mapValues(option => setValues.has(option.id))
				.value();
			$debug('$watch', this.value, setValues, this.rawValue);
		}, { immediate: true });
	},
});
</script>

<template>
	<div class="search-input-tag-checkboxes">
		<div v-for="option in options" :key="option.id" class="custom-control custom-checkbox">
			<input
				class="custom-control-input"
				type="checkbox"
				:id="`${_uid}-${option.id}`"
				:checked="!!rawValue[option.id]"
				@change="setOption(option.id, $event.target.checked)"
			>
			<label
				class="custom-control-label"
				:for="`${_uid}-${option.id}`"
			>
				{{option.title}}
			</label>
		</div>
	</div>
</template>
