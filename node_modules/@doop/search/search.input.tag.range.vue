<script lang="js" frontend>
import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTagRange').enable(true);

/**
* TODO: Docs
*/
app.component('searchInputTagRange', {
	data() { return {
		rawValue: undefined,
	}},
	props: {
		value: {type: String},
		min: {type: Number, default: 0},
		max: {type: Number, default: 100},
		// NOTE: Currently, no browser fully supports these features.
		// Firefox doesn't support hash marks and labels at all, for example,
		// while Chrome supports hash marks but doesn't support labels.
		// Version 66 (66.0.3359.181) of Chrome supports labels but the <datalist> tag has to be styled with CSS as its display property is set to none by default, hiding the labels.
		// @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range
		tickmarks: {type: Array},
	},
	methods: {
		handleChange(e) {
			$debug('handleChange', e);
			this.rawValue = e.target.value;
			//:value="slotProps.tagValues['insTrust']"
			//@change="slotProps.setTagValue('insTrust', $event.target.value)"
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
	<div class="search-input-tag-range">
		<div class="form-control">
			<input
				type="range"
				:min="min"
				:max="max"
				:list="`tickmarks_${_uid}`"
				:value="this.rawValue"
				@change="handleChange"
				
			/>
			<datalist v-if="tickmarks" :id="`tickmarks_${_uid}`">
				<option
					v-for="(tick, index) in tickmarks" :key="index"
					:value="tick"
					:label="tick">
				</option>
			</datalist>
		</div>
	</div>
</template>

<style lang="scss">
.search-input-tag-range {
	.form-control {
		display: inline-block;
	}

	datalist {
		display: flex;
		justify-content: space-between;
		padding-left: 0.15em;
		padding-right: 0.15em;
	}

	input {
		width: 100%;
	}
}
</style>
