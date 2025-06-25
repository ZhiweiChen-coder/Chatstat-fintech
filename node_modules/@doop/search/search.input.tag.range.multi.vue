<script lang="js" frontend>
import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTagRangeMulti').enable(true);

import Multirange from 'multirange';
//import 'multirange/multirange.css';

/**
* TODO: Docs
*/
app.component('searchInputTagRangeMulti', {
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
		setValue(value) {
			$debug('setValue', value);
			this.rawValue = value;
			this.encodeQuery();
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			$debug('encodeQuery', this.rawValue, this.min, this.max);
			const parts = this.rawValue.split(',').map(p => parseInt(p));
			// Default is empty string when "min,max" are selected
			if (parts[0] === this.min && parts[1] === this.max) {
				this.$emit('change', '');
			} else {
				this.$emit('change', parts.join('-'));
			}
		},
	},

	mounted() {
		Multirange.init();

		// Respond to changes on ghost by pulling value from original
		const original = $(`#search-input-tag-range-multi-${this._uid}`);
		const ghost = $(this.$el).find('input[type="range"].multirange.ghost');
		ghost.on('change', e => this.setValue(original.val()));
	},

	created() {
		this.$debug.enable(false);

		this.$watch('value', () => {
			if (this.value) {
				this.rawValue = this.value.replace('-',',');
			} else {
				// Default to "min,max"
				this.rawValue = this.min + ',' + this.max;
			}
		}, { immediate: true });
	},
});
</script>

<template>
	<div class="search-input-tag-range-multi">
		<div class="form-control">
			<input
				:id="`search-input-tag-range-multi-${_uid}`"
				type="range"
				multiple
				:min="min"
				:max="max"
				:list="`tickmarks_${_uid}`"
				:value="this.rawValue"
				@change="setValue($event.target.value)"
			/>
			<datalist v-if="tickmarks" :id="`tickmarks_${_uid}`">
				<option
					v-for="(tick, index) in tickmarks"
					:key="index"
					:value="tick"
					:label="tick"
				></option>
			</datalist>
		</div>
	</div>
</template>

<style lang="scss">
.search-input-tag-range-multi {
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

	// FIXME: Positioning of track seems off, looks right on toughengineer demo
	// FIXME: datalist ticks vanish when removing default styles

	// From https://toughengineer.github.io/demo/slider-styler/slider-styler.html {{{
	input[type='range'].multirange {
		height: 1em;
		-webkit-appearance: none;
	}

	/*progress support*/
	input[type='range'].multirange.slider-progress {
		--range: calc(var(--max) - var(--min));
		--ratio: calc((var(--value) - var(--min)) / var(--range));
		--sx: calc(0.5 * 1em + var(--ratio) * (100% - 1em));
	}

	input[type='range'].multirange:focus {
		outline: none;
	}

	/*webkit*/
	input[type='range'].multirange::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 1em;
		height: 1em;
		border-radius: 1em;
		background: #007cf8;
		border: none;
		box-shadow: 0 0 2px black;
		margin-top: calc(max((0.75em - 1px - 1px) * 0.5, 0px) - 1em * 0.5);
	}

	input[type='range'].multirange::-webkit-slider-runnable-track {
		height: 0.75em;
		border: 1px solid #b2b2b2;
		border-radius: 0.5em;
		background: #efefef;
		box-shadow: none;
	}

	input[type='range'].multirange::-webkit-slider-thumb:hover {
		background: #0061c3;
	}

	input[type='range'].multirange:hover::-webkit-slider-runnable-track {
		background: #e5e5e5;
		border-color: #9a9a9a;
	}

	input[type='range'].multirange::-webkit-slider-thumb:active {
		background: #2f98f9;
	}

	input[type='range'].multirange:active::-webkit-slider-runnable-track {
		background: #f5f5f5;
		border-color: #c1c1c1;
	}

	input[type='range'].multirange.slider-progress::-webkit-slider-runnable-track {
		background: linear-gradient(#007cf8, #007cf8) 0 / var(--sx) 100% no-repeat,
			#efefef;
	}

	input[type='range'].multirange.slider-progress:hover::-webkit-slider-runnable-track {
		background: linear-gradient(#0061c3, #0061c3) 0 / var(--sx) 100% no-repeat,
			#e5e5e5;
	}

	input[type='range'].multirange.slider-progress:active::-webkit-slider-runnable-track {
		background: linear-gradient(#2f98f9, #2f98f9) 0 / var(--sx) 100% no-repeat,
			#f5f5f5;
	}

	/*mozilla*/
	input[type='range'].multirange::-moz-range-thumb {
		width: 1em;
		height: 1em;
		border-radius: 1em;
		background: #007cf8;
		border: none;
		box-shadow: 0 0 2px black;
	}

	input[type='range'].multirange::-moz-range-track {
		height: max(calc(0.75em - 1px - 1px), 0px);
		border: 1px solid #b2b2b2;
		border-radius: 0.5em;
		background: #efefef;
		box-shadow: none;
	}

	input[type='range'].multirange::-moz-range-thumb:hover {
		background: #0061c3;
	}

	input[type='range'].multirange:hover::-moz-range-track {
		background: #e5e5e5;
		border-color: #9a9a9a;
	}

	input[type='range'].multirange::-moz-range-thumb:active {
		background: #2f98f9;
	}

	input[type='range'].multirange:active::-moz-range-track {
		background: #f5f5f5;
		border-color: #c1c1c1;
	}

	input[type='range'].multirange.slider-progress::-moz-range-track {
		background: linear-gradient(#007cf8, #007cf8) 0 / var(--sx) 100% no-repeat,
			#efefef;
	}

	input[type='range'].multirange.slider-progress:hover::-moz-range-track {
		background: linear-gradient(#0061c3, #0061c3) 0 / var(--sx) 100% no-repeat,
			#e5e5e5;
	}

	input[type='range'].multirange.slider-progress:active::-moz-range-track {
		background: linear-gradient(#2f98f9, #2f98f9) 0 / var(--sx) 100% no-repeat,
			#f5f5f5;
	}

	/*ms*/
	input[type='range'].multirange::-ms-fill-upper {
		background: transparent;
		border-color: transparent;
	}

	input[type='range'].multirange::-ms-fill-lower {
		background: transparent;
		border-color: transparent;
	}

	input[type='range'].multirange::-ms-thumb {
		width: 1em;
		height: 1em;
		border-radius: 1em;
		background: #007cf8;
		border: none;
		box-shadow: 0 0 2px black;
		margin-top: 0;
		box-sizing: border-box;
	}

	input[type='range'].multirange::-ms-track {
		height: 0.75em;
		border-radius: 0.5em;
		background: #efefef;
		border: 1px solid #b2b2b2;
		box-shadow: none;
		box-sizing: border-box;
	}

	input[type='range'].multirange::-ms-thumb:hover {
		background: #0061c3;
	}

	input[type='range'].multirange:hover::-ms-track {
		background: #e5e5e5;
		border-color: #9a9a9a;
	}

	input[type='range'].multirange::-ms-thumb:active {
		background: #2f98f9;
	}

	input[type='range'].multirange:active::-ms-track {
		background: #f5f5f5;
		border-color: #c1c1c1;
	}

	input[type='range'].multirange.slider-progress::-ms-fill-lower {
		height: max(calc(0.75em - 1px - 1px), 0px);
		border-radius: 0.5em 0 0 0.5em;
		margin: -1px 0 -1px -1px;
		background: #007cf8;
		border: 1px solid #b2b2b2;
		border-right-width: 0;
	}

	input[type='range'].multirange.slider-progress:hover::-ms-fill-lower {
		background: #0061c3;
		border-color: #9a9a9a;
	}

	input[type='range'].multirange.slider-progress:active::-ms-fill-lower {
		background: #2f98f9;
		border-color: #c1c1c1;
	}

	// }}}

	// Remove everything from original {{{
	/*
	input[type='range'].multirange.original,
	input[type='range'].multirange.ghost::-webkit-slider-runnable-track
	input[type='range'].multirange.original::-webkit-slider-thumb {
		-webkit-appearance: none;
	}
	*/
	// }}}

	// From multirange.css {{{
	input[type='range'].multirange {
		//padding: 0;
		//margin: 0;
		//display: inline-block;
		//vertical-align: top;
	}

	input[type='range'].multirange.original {
		position: absolute;
	}

	input[type='range'].multirange.original::-webkit-slider-thumb {
		position: relative;
		z-index: 2;
	}

	input[type='range'].multirange.original::-moz-range-thumb {
		transform: scale(1); /* FF doesn't apply position it seems */
		z-index: 1;
	}

	input[type='range'].multirange::-moz-range-track {
		border-color: transparent; /* needed to switch FF to "styleable" control */
	}

	input[type='range'].multirange.ghost {
		--track-default: transparent;
		--track-background: linear-gradient(
				to right,
				var(--track-default) var(--low),
				var(--range-color) 0,
				var(--range-color) var(--high),
				transparent 0
			)
			no-repeat 0 45% / 100% 40%;
		--range-color: hsl(190, 80%, 40%);
		position: relative;
		background: var(--track-background);
	}

	input[type='range'].multirange.ghost::-webkit-slider-runnable-track {
		background: var(--track-background);
	}

	input[type='range'].multirange.ghost::-moz-range-track {
		background: var(--track-background);
	}
	// }}}

	// Fix width overflow when original is absolute positioned {{{
	input[type='range'].multirange.original {
		position: relative;
	}

	input[type='range'].multirange.ghost {
		position: relative;
		top: -24px;
	}
	// }}}
}
</style>
