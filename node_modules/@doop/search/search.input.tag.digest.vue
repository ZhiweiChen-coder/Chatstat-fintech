<script lang="js" frontend>
import Debug from '@doop/debug';

const $debug = Debug('@doop/search').enable(true);

// TODO: Make "widgets/dynamicComponent.vue" a package and include as peerDependency

/**
* TODO: Docs
*/
app.component('searchInputTagDigest', {
	data() { return {
		rawValue: undefined,
	}},
	props: {
		value: {type: String},
		options: {type: Object},
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


		/**
		* Compute and return the properties of a digest component
		* @param {Object} tag The tag being exmined
		* @returns {Object} The computed digestSelect widget properties
		*/
		// TODO: Move to digest specific component
		widgetDigestProps() {
			$debug('widgetDigestProps');

			return {
				// Set suitable digest values
				allowRemove: true,
				class: 'col-sm-9 form-control-plaintext',
				classValid: 'badge badge-primary',
				classInvalid: 'badge badge-danger',
				lazy: false,
				selected: this.rawValue,
				...this.options, // Merge in remainder of digest options
			};
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
	<div class="search-input-tag-digest">
		<dynamic-component
			component="digestSelect"
			:props="widgetDigestProps()"
			:events="{change: handleChange}"
		/>
	</div>
</template>
