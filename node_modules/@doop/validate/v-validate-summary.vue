<script lang="js" frontend>
/**
* Display a list of errors (if any) from all child v-validate directives within a selector
*
* @param {string} [selectorUpwards='form, .form-horizontal'] jQuery selector to find the top level form element to search-down from
* @param {string} [selectorDownwards='[data-v-validate-error]'] Selector to seek for downwards when selecting errors
* @param {string} [selectorTranslate] Function to translate selected errors to an object. Should return `{el: DOMElement, text: String}`. Defaults to extracting text from child elements + source element
*
* @slot errors Overall error template, defaults to an alert area. Binds with properties `{errors: Array<Object>}`
* @slot error Single error element, defaults to a single bullet point. Binds with properties `{error: Object}`
*/
app.component('vValidateSummary', {
	data() { return {
		errors: undefined,
	}},
	props: {
		selectorUpwards: {type: String, default: 'form, .form-horizontal, body'},
		selectorDownwards: {type: String, default: '[data-v-validate-error]'},
		selectorTranslate: {type: Function, default(el) { return ({
			el: el,
			text: $(el).attr('data-v-validate-error'),
		})}},
	},
	methods: {
		/**
		* Find and refresh all v-validate entries based on the properties
		*/
		refresh() {
			var parent = $(this.$el).closest(this.selectorUpwards); // Recurse to parent element(s)
			if (parent.length < 1) throw new Error(`No parent selector found from selector "${this.selectorUpwards}", specify selectorUpwards prop to override`);

			this.errors = parent.find(this.selectorDownwards)
				.toArray()
				.map(el => this.selectorTranslate(el))
		},

		/**
		* Scroll down to an element by the DOM reference
		* @param {DOMElement} el The DOM element to scroll to
		*/
		navigateTo(el) {
			el.scrollIntoView({behaviour: 'smooth'});
		},
	},
	mounted() {
		this.refresh();
	},
});
</script>

<template>
	<div>
		<slot name="errors" :error="errors">
			<div class="alert alert-warning">
				<ul>
					<slot v-for="error in errors" name="error" :error="error">
						<li>
							<a @click="navigateTo(error.el)">
								{{error.text}}
							</a>
						</li>
					</slot>
				</ul>
			</div>
		</slot>
	</div>
</template>
