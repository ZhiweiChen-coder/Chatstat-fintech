<script lang="js" frontend>
import Debug from '@doop/debug';

/**
* Search widget that supports custom definable widgets that compose into a complex, tagged, search query compatible with the Doop search backend
*
* @param {string} [value] Initial value to decode and display, if omitted `readQuery` is used instead
* @param {string} [placeholder="Search..."] Placeholder text to display
* @param {boolean} [secondClickDropdown=true] Clicking a second time on the input when its already active will toggle the dropdown
* @param {string|boolean} [readQuery='q'] If non-falsy, try to read the query from $router.query into the current state
*
* @param {string} [redirect] Front end URL to redirect to on submission (rather than just emitting)
* @param {function} [redirectDecide] Function to call as `(searchQuery)` which can surpress redirection behaviour. Return async truthy to pass through to normal redirect behaviour, otherwise falsy values are aborted
* @param {string} [redirectQuery='q'] Query element to set to the new search parameter when redirecting
*
* @param {Array<Object>} tags Collection of search tags to configure
* @param {string} tag.title The human readable title of the tag
* @param {string} tag.tag The name of the tag being defined
* @param {string} tag.type Internal search tag type. ENUM: 'hidden', 'date', 'dateRange', 'digest', 'checkboxes', 'radios'
* @param {Object} [tag.dateFormat='DD/MM/YYYY'] (type==date|dateRange) Moment compatible date format to input/output in tags
* @param {Object} [tag.seperator='-'] (type==dateRange) Seperator string between start + end
* @param {Object} [tag.startOnlyTag] (type==dateRange) Change tag to this value if only the start date is specified instead of using `${start}${seperator}${end}` format
* @param {Object} [tag.endOnlyTag] (type==dateRange) Change tag to this value if only the end date is specified instead of using `${start}${seperator}${end}` format
* @param {Object} [tag.digest] (type==digest) Digest options (some suitable search defaults are assumed but can be overriden)
* @param {array<String>|array<Object>} [tag.options] (type==checkboxes|radios) An array of string options (titles calculated via startCase) or options in the form `{id, title}`
* @param {string} [tag.clearValue] (type==radios) ID of the value assumed to clear the query, first options value is assumed if omitted
* @param {*} [tag.default] Default value for the tag if any
* @param {function} [tag.toQuery] Function called as `(tag)` to convert tag into a search string (a default is specified that approximates to `tag => ${tag.tag}:${tag.value}`)
*
* @param [boolean] [dropdownFuzzy=true] Repeat the general "fuzzy" search area as the first line in the search dropdown
*
* @emits preRedirect Emitted as `(queryString)` before redirecting to new destination, if the result is `false` the redirect is aborted
* @emits change Emitted as `(queryString)` with any newly computed search query when a search has been submitted
* @emits input Emitted as `(queryString)` with any user input - differs from `change` is the query may be partially complete
*
* @slot dropdown Search dropdown helper template
* @slot footer Default footer area to display (defaults to a simple submit button)
*/
app.component('searchInput', {
	data() { return {
		searchQuery: '', // Complete query
		fuzzyQuery: '', // Keyword query 
		tagsQuery: '', // Tags query
		tagValues: {}, // Tag queries by key
		searchHasFocus: false,
		showHelper: false, // Whether the helper area is visible, use setHelperVisibility() to change
	}},
	computed: {
		hasContent() {
			return !!this.searchQuery;
		},
	},
	props: {
		value: {type: String},
		secondClickDropdown: {type: Boolean, default: true},
		placeholder: {type: String, default: 'Search...'},
		readQuery: {type: [String, Boolean], default: 'q'},
		redirect: {type: String},
		redirectDecide: {type: Function},
		redirectQuery: {type: String, default: 'q'},
		tags: {type: Array},
		dropdownFuzzy: {type: Boolean, default: true},
		parentQuery: {type: String, default: ''}
	},
	methods: {
		/**
		* Submit the search form
		*/
		submit() {
			this.$debug('submit', `"${this.searchQuery}"`);
			if (this.redirect) { // Perform router redirect + we have a non-blank query
				this.setHelperVisibility(false);

				Promise.resolve(
					this.redirectDecide // Do we have a possible blocking function to call first?
						? this.redirectDecide(this.searchQuery) // Call it
						: true // Assume all should be redirected
				)
					.then(result => {
						if (!result) return; // Abort redirect if preRedirect returns false

						this.$router.push({
							path: this.redirect,
							...(this.searchQuery ? {query: {[this.redirectQuery]: this.searchQuery}} : {}),
						})
							.catch(_.noop);
					})
			}

			this.$emit('change', this.searchQuery);
		},


		/**
		* Clear the search query
		*/
		clear() {
			this.$debug('clear', this.fuzzyQuery, this.tagValues);
			this.fuzzyQuery = '';
			this.tagValues = {};
			this.encodeQuery();
			this.$emit('change', this.searchQuery);
		},


		/**
		* Set the visiblity of the helper
		* @param {boolean|string} [state='toggle'] Either the visibility boolean or 'toggle' to switch
		*/
		setHelperVisibility(state = 'toggle') {
			this.$debug('setHelperVisibility', state);
			this.showHelper = state == 'toggle' ? !this.showHelper : !!state;

			if (this.showHelper) {
				// TODO: Would this be a good time to update dropdowns search contents with whatever changes may have been made to main input field?
				// Hook into global body click handler
				this.$timeout(()=> $('body').on('click', '*', this.handleBodyClick), 250); // Let DOM settle then bind to clicking outside the area to close
				app.vue.$on('$beforeRoute', this.handleRoute);
			} else {
				// Destroy global body click handler
				$('body').off('click', '*', this.handleBodyClick);
				app.vue.$off('$beforeRoute', this.handleRoute);
			}
		},


		/**
		* Detect and handle top level body clicks
		* Close the dialog if the click is detected anywhere outside the DOM element tree
		*/
		handleBodyClick(e) {
			if (!this.showHelper) return; // Helper is invisible anyway - disguard
			if (!$(e.target).parents('.search-input-helper').toArray().length) { // Helper is not in DOM tree upwards - user clicked outside open search helper area
				e.stopPropagation();
				this.setHelperVisibility(false);
			}
		},

		/**
		* Detect and handle routing while the search helper is open
		*/
		handleRoute(e) {
			this.$debug('handleRoute', e);
			if (!this.showHelper) return; // Helper is invisible anyway - disguard
			this.setHelperVisibility(false);
		},


		/**
		* Set the value of a search tag
		* @param {string|array} Path Path relative to tagValues to set within
		* @param {*} value The value to set
		*/
		setTagValue(path, value) {
			this.$debug('setTagValue', path, value);
			this.$setPath(this.tagValues, path, value);
			this.encodeQuery();
		},


		/**
		* Compute local state into a search query (also set the search query display)
		*/
		encodeQuery() {
			this.$debug('encodeQuery', 'input', this.fuzzyQuery, this.tagValues);

			// Remove empty tags or undefined tags
			const tagValues = _(this.tagValues).omitBy(_.isEmpty).omitBy(_.isUndefined).value();
			this.tagsQuery = this.$search.stringify(tagValues);
			this.searchQuery =
				// Only append an extra space if tags have been added
				(
					this.fuzzyQuery
						? this.tagsQuery.length > 0
							? this.fuzzyQuery + ' '
							: this.fuzzyQuery
						: ''
				) // Human fuzzy query
				+ this.tagsQuery;
			this.$debug('encodeQuery', 'output', `"${this.searchQuery}"`, this.tagsQuery);
		},


		/**
		* Decode a string query into local settings
		* @param {string} query String query to decode back into its component parts
		*/
		decodeQuery(query) {
			this.$debug('decodeQuery', 'input', query);
			const queryHash = this.$search.parseTags(query);
			this.fuzzyQuery = queryHash.$fuzzy;
			this.tagValues = _.omit(queryHash, '$fuzzy');
			this.tagsQuery = this.$search.stringify(this.tagValues);
			this.$debug('decodeQuery', 'output', this.fuzzyQuery, this.tagValues, this.tagsQuery);
		},


		/**
		* If `secondClickDropdown` is active check if we have focus and if so open the dropdown
		*/
		click() {
			if (this.searchHasFocus) return this.setHelperVisibility('toggle');
		},
	},

	watch: {
		searchQuery() {
			console.log('SQ input', this.searchQuery);
			this.$emit('input', this.searchQuery);
		},
	},

	created() {
		this.$debug.enable(false);

		// TODO: Changes made in the main input box should be reflected in dropdown, without creating an infinite update loop
		this.$watchAll(['$route.query', 'value'], ()=> { // React to query changes (if $props.readQuery is enabled), NOTE: Must fire after tags
			this.$debug('$watchAll', this.$route.query, this.value);
			var inputQuery; // Query to process
			if (this.value) { // Have an input value
				inputQuery = this.value;
			} else if (this.readQuery) {
				if (this.redirect && this.$route.path != this.redirect) return; // Path portion redirect does not match this page - ignore (allows `?q=search` to be reused on other pages other than global search redirect destination)
				inputQuery = this.$route.query[this.readQuery];
			} else { // Take no input
				return;
			}

			this.decodeQuery(inputQuery);
			this.encodeQuery();
		}, {deep: true, immediate: true});
	},

	beforeDestroy() {
		this.setHelperVisibility(false); // Clean up body click handlers
	},
});
</script>

<template>
	<form
		@submit.prevent="submit"
		@keydown.tab="setHelperVisibility('toggle')"
		@keydown.enter="submit"
		role="search"
		class="search-input"
		:class="{
			'input-search-focused': searchHasFocus,
			'helper-open': showHelper,
			'has-content': hasContent,
		}"
	>
		<div class="search-input-container">
			<div class="input-group">
				<input
					v-model="searchQuery"
					type="search"
					:placeholder="placeholder"
					class="form-control search-input-fuzzy"
					@click="click"
					@focus="searchHasFocus = true"
					@blur="searchHasFocus = false"
					autocomplete="off"
				/>
				<div class="input-group-append search-input-verbs">
					<button class="btn btn-outline-secondary" type="submit">
						<i class="far fa-search"/>
					</button>
					<button class="btn btn-outline-secondary search-input-dropdown" @click.prevent="setHelperVisibility('toggle')">
						<i class="far fa-chevron-down"/>
					</button>
				</div>
			</div>
			<div class="search-input-helper form-horizontal container pt-1">
				<div v-if="dropdownFuzzy" class="form-group row">
					<label class="col-sm-3 col-form-label">Search</label>
					<div class="col-sm-9">
						<input
							v-model="fuzzyQuery"
							type="search"
							class="form-control"
							@input="encodeQuery"
							autocomplete="off" 
						/>
					</div>
				</div>
				<slot name="dropdown" :tags="tags" :tag-values="tagValues" :set-tag-value="setTagValue">
					<search-input-tags v-if="tags" :tags="tags" :values="tagValues" @change="$event.forEach(tag => setTagValue(tag.tag, tag.value))" />
				</slot>
				<slot name="footer">
					<div class="form-group row d-flex justify-content-end px-2">
						<button type="submit" class="btn btn-primary">Search</button>
					</div>
				</slot>
			</div>
		</div>
	</form>
</template>

<style lang="scss">
/* Search input widget {{{ */
/*
.search-input .search-input-fuzzy {
	width: 100% !important;
}
*/
/* }}} */

/* Search input verbs (right aligned buttons) {{{ */
/*
.search-input .search-input-verbs {
	position: absolute;
	right: 24px;
	top: 16px;
}

.search-input .search-input-verbs > a,
.search-input .search-input-verbs > button {
	width: 30px;
	height: 30px;
	place-content: center;
	place-items: center;
	display: inline-flex;
}

.search-input.helper-open .search-input-verbs > a.fa-chevron-down,
.search-input.helper-open .search-input-verbs > button.fa-chevron-down {
	background: var(--main-darker);
	border-radius: 50%;
	color: var(--white);
}
*/
/* }}} */

/* Search helper {{{ */
.topbar .navbar-custom .menu-left {
	overflow: visible;
}

.search-input .search-input-helper {
	display: none;
	z-index: 1000;
	background: #FFF;
	position: absolute;
	left: 50px; // "container" class sets width so we must assure helper is far to the left
	border: 1px solid var(--secondary);
	border-bottom-left-radius: 5px;
	border-bottom-right-radius: 5px;
	min-width: 400px;
	max-height: calc(100vh - 100px);
	overflow-y: auto;
	overflow-x: hidden;
}

/*
.search-input .search-input-helper .form-control,
.search-input .search-input-helper .form-control:focus {
	color: var(--gray-dark);
	border-bottom: 1px solid var(--secondary);
	border-radius: 0px;
	width: 100%;
	padding: 0;
}

.search-input .search-input-helper input[type=text].form-control {
	border-top: none;
	border-left: none;
	border-right: none;
}
*/

/*
.search-input .search-input-helper label {
	user-select: none;
}
*/

.search-input .search-input-helper .vdp-datepicker {
	border-bottom: 1px solid var(--secondary);
}

.search-input .search-input-helper .vdp-datepicker input {
	border: none;
	width: 100%;
}

.search-input .search-input-helper .vdp-datepicker .vdp-datepicker__clear-button {
	position: absolute;
	right: 0px;
}

.search-input.helper-open .search-input-helper {
	display: block;
}
/* }}} */

/* Button placement {{{ */
/*
.search-input .form-control, .search-input .form-control:focus {
	width: 400px;
}

.search-input a.fa-search {
	left: auto;
	right: 30px;
}

.search-input a.fa-chevron-down {
	left: auto;
	right: 5px;
}
*/
/* }}} */

/* Theme fixes {{{ */
/*
.search-input .digest-select a {
	position: inherit;
	top: initial;
	left: initial;
	height: auto;
	line-height: 1;
	width: auto;
}
.search-input .digest-select a.btn-hover-danger {
	flex-grow: 0;
	color: inherit;
	border-radius: 0;
	width: 31px;
}
*/
/* }}} */

/* Expand search area when search has content or helper is expanded {{{ */
%search-expanded {
	.input-group {
		width: calc(100vw - 500px);
	}
}

.search-input {
	&.has-content {
		@extend %search-expanded;
	}

	&.helper-open {
		@extend %search-expanded;
	}
}
/* }}} */
</style>
