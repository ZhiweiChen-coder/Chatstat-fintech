<script lang="js" frontend>
import Debug from '@doop/debug';

const $debug = Debug('@doop/search:searchInputTags').enable(true);

/**
* TODO: Docs
*/
app.component('searchInputTags', {
	data() { return {
		tagValues: {}, // Lookup values for each tag
	}},
	props: {
		values: {type: Object},
		tags: {type: Array, required: true},
	},
	methods: {
		/**
		* Set the value of a search tag
		* @param {string|array} Path Path relative to tagValues to set within
		* @param {*} value The value to set
		*/
		setTagValue(path, value) {
			$debug('setTagValue', path, value);
			this.$setPath(this.tagValues, path, value);
			this.encodeQuery();
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			$debug('encodeQuery', 'input', this.tags, this.tagValues);

			const out = [];
			this.$props.tags.forEach(tag => {
				switch (tag.type) {
					// Backwards compatible special handling of complex tag configurations {{{
					case 'dateRange':
						$debug('Encoding dateRange', tag, this.tagValues[tag.tag]);
						const separator = tag.separator || '-';
						const rawValue = this.tagValues[tag.tag];
						if (tag.startOnlyTag && _.endsWith(rawValue, separator)) {
							$debug('with startOnlyTag', rawValue);
							out.push({
								tag: tag.startOnlyTag,
								value: _.trim(rawValue, '-'),
							});
							out.push({
								tag: tag.tag,
								value: undefined,
							});
							if (tag.endOnlyTag) out.push({
								tag: tag.endOnlyTag,
								value: undefined,
							});
						} else if (tag.endOnlyTag && _.startsWith(rawValue, separator)) {
							$debug('with endOnlyTag', rawValue);
							out.push({
								tag: tag.endOnlyTag,
								value: _.trim(rawValue, '-'),
							});
							out.push({
								tag: tag.tag,
								value: undefined,
							});
							if (tag.startOnlyTag) out.push({
								tag: tag.startOnlyTag,
								value: undefined,
							});
						} else {
							$debug('with rawValue', rawValue);
							//tag.value = rawValue;
							out.push({
								tag: tag.tag,
								value: rawValue,
							});
							if (tag.startOnlyTag) out.push({
								tag: tag.startOnlyTag,
								value: undefined,
							});
							if (tag.endOnlyTag) out.push({
								tag: tag.endOnlyTag,
								value: undefined,
							});
						}
						break;
					// }}}
					default:
						out.push({
							tag: tag.tag,
							value: this.tagValues[tag.tag],
						});
						break;
				}
			});

			$debug('encodeQuery', 'output', out);
			this.$emit('change', out);
		},
	},

	created() {
		// Initialise from provided values or default
		this.$props.tags.forEach(tag => {
			$debug('value', tag.tag, this.values[tag.tag]);
			switch (tag.type) {
				// Backwards compatible special handling of complex tag configurations {{{
				case 'dateRange':
					$debug('Creating dateRange', tag);
					const separator = tag.separator || '-';
					if (this.values[tag.tag]) {
						$debug('from tag', this.values[tag.tag]);
						this.$set(this.tagValues, tag.tag, this.values[tag.tag]);
					} else if (this.values[tag.startOnlyTag] && this.values[tag.endOnlyTag]) {	
						$debug('from both', this.values[tag.startOnlyTag], this.values[tag.endOnlyTag]);
						this.$set(this.tagValues, tag.tag, this.values[tag.startOnlyTag] + separator + this.values[tag.endOnlyTag]);
					} else if (this.values[tag.startOnlyTag]) {
						$debug('from startOnlyTag', this.values[tag.startOnlyTag]);
						this.$set(this.tagValues, tag.tag, this.values[tag.startOnlyTag] + separator);
					} else if (this.values[tag.endOnlyTag]) {
						$debug('from endOnlyTag', this.values[tag.endOnlyTag]);
						this.$set(this.tagValues, tag.tag, separator + this.values[tag.endOnlyTag]);
					}
					break;
				// }}}
				default:
					if (this.values[tag.tag]) {
						this.$set(this.tagValues, tag.tag, this.values[tag.tag]);
					} else if (tag.default) {
						$debug('default', tag.default);
						this.$set(this.tagValues, tag.tag, tag.default);
					}
					break;
			}
		});
		$debug('Initialised', this.tagValues);
	},
});
</script>

<template>
	<div class="search-input-tags">
		<div v-for="tag in tags.filter(ct => ct.type != 'hidden')" :key="tag.tag" class="form-group">
			<label class="col-sm-3 col-form-label">{{tag.title}}</label>
			<div class="col-9 mt-2">
				<!-- type='digest' {{{ -->
				<search-input-tag-digest v-if="tag.type == 'digest'"
					:value="tagValues[tag.tag]"
					:options="tag.digest"
					@change="setTagValue(tag.tag, $event)"
				/>
				<!-- }}} -->
				<!-- type='date' {{{ -->
				<search-input-tag-date v-else-if="tag.type == 'date'"
					:date-format="tag.dateFormat"
					:value="tagValues[tag.tag]"
					@change="setTagValue(tag.tag, $event)"
				/>
				<!-- }}} -->
				<!-- type='dateRange' {{{ -->
				<search-input-tag-date-range v-else-if="tag.type == 'dateRange'"
					:date-format="tag.dateFormat"
					:value="tagValues[tag.tag]"
					@change="setTagValue(tag.tag, $event)"
				/>
				<!-- }}} -->
				<!-- type='checkboxes' {{{ -->
				<search-input-tag-checkboxes v-else-if="tag.type == 'checkboxes'"
					:options="tag.options"
					:value="tagValues[tag.tag]"
					@change="setTagValue(tag.tag, $event)"
				/>
				<!-- }}} -->
				<!-- type='radios' {{{ -->
				<search-input-tag-radios v-else-if="tag.type == 'radios'"
					:options="tag.options"
					:value="tagValues[tag.tag]"
					@change="setTagValue(tag.tag, $event)"
				/>
				<!--
				<div v-else-if="tag.type == 'radios'">
					<div v-for="option in tag.options" :key="option.id" class="form-check mr-3">
						<input
							class="form-check-input"
							type="radio"
							:id="`${tag.tag}-${option.id}`"
							:name="tag.tag"
							:checked="tagValues[tag.tag] == option.id"
							@change="setTagValue(tag.tag, option.id)"
						/>
						<label
							class="form-check-label"
							:for="`${tag.tag}-${option.id}`"
						>
							{{option.title}}
						</label>
					</div>
				</div>
				-->
				<!-- }}} -->
				<!-- type unknown {{{ -->
				<div v-else class="alert alert-danger">
					Unknown search tag type "{{tag.type}}"
				</div>
				<!-- }}} -->
			</div>
		</div>
	</div>
</template>
