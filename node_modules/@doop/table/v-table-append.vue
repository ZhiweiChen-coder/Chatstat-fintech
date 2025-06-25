<script lang="js" frontend>
import Debug from '@doop/debug';

const $debug = Debug('@doop/table').enable(false);

// TODO: Import lodash?

/**
* Quick and dirty directive designed to sit in the <tfoot/> area of a table which immediately appends a new row upon any interaction
* Data lists are a browser supported method to provide suggested dropdown list data to input elements
*
* @param {Object|function} options The options to process, if given a function this is assumed to be the value of `handler`
* @param {string} [options.events='keyup'] Space seperated list of events to listen for on all children matching `selector`
* @param {string} [options.selector='intput'] List of child elements to react to
* @param {function} [options.mapper] Async function to fetch all values of child elements, default is to simply fetch all base DOM values as an array
* @param {function} [options.handler] Function to append data, called as `(values<array>)`
* @param {function} [options.focus] Async function to focus the found last row of the table, defaults to finding the parent, selecting the last row and focusing the first element
*
* @example Append to an existing array upon any user interaction
* <tfoot v-table-append="v => widgets.push({code: v[0], number: v[1]})">
*   <tr>
*     <td><input type="text"/></td>
*     <td><input type="number"/></td>
*   </tr>
* </tfoot>
*/
app.directive('v-table-append', {
	bind(el, binding) {
		var $el = $(el);
		var settings = {
			handler: _.isFunction(binding.value) ? binding.value : {},
			events: 'keyup',
			selector: 'input',
			mapper: $parent => $parent.find('input').toArray().map(i => i.value),
			...(_.isPlainObject(binding.value) && binding.value),
		};
		if (!settings.handler) throw new Error('v-table-append function handler required');

		$el
			.on(settings.events, settings.selector, e => Promise.resolve()
				.then(()=> settings.mapper($el))
				.then(values => settings.handler(values))
				.then(()=> app.vue.$nextTick())
				.then(() => {
					// Find matching elements within footer.
					const matches = $el.find(settings.selector);
					$debug('matches', matches);
					const target = $el.closest('table').find('tbody tr').last().find(settings.selector).get(matches.index(e.currentTarget));
					$debug('target', target);
					// Focus on the element at same index within body.
					// FIXME: Bizarrely when events='focusin', setting focus on this target element re-triggers this handler unless decoupled with timer.
					setTimeout(() => target.focus());
				})
			)
	},
});
</script>
