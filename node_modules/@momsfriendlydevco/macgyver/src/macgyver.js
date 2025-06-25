/**
* Shared front-end / back-end MacGyver utilities
* For Vue specific utilities see ./macgyver.vue
*/

import _ from 'lodash';
import sift from 'sift';
var $macgyver = {};

/**
* Storage for all MacGyver registered widgets
* Each key is the unique reference name of the component e.g. `"mgText"`
* Each value is the original options object definition passed to `Vue.mgCompoenent(name, options)`
* @var {Object}
*/
$macgyver.widgets = {};

$macgyver.$nextId = 0;
$macgyver.nextId = ()=> `mgForm${$macgyver.$nextId++}`;


/**
* Set of convenience functions to manage on-screen MacGyver forms
*/
$macgyver.forms = {};


/**
* Set the given forms spec config
* @param {string} id The ID of the form to set the config of
* @param {Object|Array} config The config to set
* @returns {MacGyver} The chainable MacGyver instance
*/
$macgyver.forms.setConfig = (id, config) => {
	if (!$macgyver.$forms[id]) $macgyver.$forms[id] = {config: {}, data: {}};
	$macgyver.$forms[id].config = $macgyver.compileSpec(config).spec;
	return $macgyver;
};


/**
* Set the given forms spec data
* @param {string} id The ID of the form to set the config of
* @param {Object|Array} data The data population to set
* @returns {MacGyver} The chainable MacGyver instance
*/
$macgyver.forms.setData = (id, data) => {
	if (!$macgyver.$forms[id]) $macgyver.$forms[id] = {config: {}, data: {}};
	$macgyver.$forms[id].data = data;
	return $macgyver;
};


/**
* Convenience function to validate all MacGyver forms on a screen and return the array of failed validations
* @param {string} [id] The form ID to validate, if omitted the first form on the page is used
* @param {boolean} [showErrors=true] Allow the form to display a list of errors as well as returning them
* @returns {array <Object>} Collection where each item is {error}
*/
$macgyver.forms.validate = (id, showErrors = true) => {
	if (!$macgyver.$forms[id]) throw new Error('Invalid MacGyver form');
	console.warn('FIXME: Validation not yet supported');

	var responses = [];
	// FIXME: This needs to work internally using flatten()
	return true;
};


/**
* Emit a message to a specific mgForm element
* @param {string} id The ID of the form to emit to
* @param {string} msg The message to emit
* @param {*} [payload...] The payload of the message to emit
*/
$macgyver.forms.emit = (id, msg, ...payload) => {
	if (!$macgyver.$forms[id]) throw new Error('Unknown form ID');
	$macgyver.$forms[id].$emit(msg, ...payload);
};


/**
* Emit a message to all child controls of a given form
* @param {string} id The ID of the form to emit to
* @param {string} msg The message to emit
* @param {*} [payload...] The payload of the message to emit
*/
$macgyver.forms.emitDown = (id, msg, ...payload) => {
	if (!$macgyver.$forms[id]) throw new Error('Unknown form ID');
	$macgyver.$forms[id].$emitDown(msg, ...payload);
};


$macgyver.forms.getPath = (id, path, fallback) => {
	return $macgyver.utils.getPath($macgyver.$forms[id], path, fallback);
};


/**
* Compute the data prototype of the form
* This is an empty object with all the defaults populated
* @param {Object} spec The form spec object to exmaine
* @returns {Object} A prototype data object with all defaults populated
*/
$macgyver.forms.getPrototype = spec =>
	$macgyver
		.flatten(spec, {type: 'spec', want: 'array', wantDataPath: true})
		.reduce((data, node) => {
			if (!node.path || !node.default) return data; // No path or default speciifed - skip

			$macgyver.utils.setPath(data, node.path, node.default);
			return data;
		}, {});


// $macgyver.notify{} {{{
/**
* A collection of ways MacGyver can notify the user
* These should be replaced by whatever your local framework supports
*/
$macgyver.notify = {};


/**
* Signify that a loading event is taking place
* This function should be overridden by the framework to include whatever load handling is requried
* By default it uses https://www.npmjs.com/package/@momsfriendlydevco/loader
* @param {string} id The unique ID for the loading item
* @param {boolean} [status=true] Whether the item is performing an operation that requires loading
* @param {Object} [options] Additional options
* @param {boolean} [options.foreground=false] Whether the loading event should occur in the foreground
*/
$macgyver.notify.loading = (id, status = true, options) => {
	if (status && options && options.foreground) {
		console.log('[$macgyver]', 'Loading foreground', id, {status});
	} else if (status) {
		console.log('[$macgyver]', 'Loading background', id, {status});
	} else {
		console.log('[$macgyver]', 'Stop loading', id, {status});
	}
};


/**
* Provide a warning message to the user
* @param {string} message The message to display
*/
$macgyver.notify.warn = message => console.log('[$macgyver]', 'WARN', message);


/**
* Provide an error message to the user
* @param {string} message The message to display
*/
$macgyver.notify.error = message => console.log('[$macgyver]', message);
// }}}


/**
* Flatten the a spec into an object lookup where each key is the dotted notation of the key
* NOTE: Specifying {want:'array'} will add the extra property 'path' onto the output collection
* @param {Object|array} root The data or spec object to examine, this should be the root object but can also convert arrays into objects on the fly (although this is slower)
* @param {Object} [options] Optional settings to use
* @param {number} [options.maxDepth=0] How far down the tree to recurse, set to falsy to infinitely recurse
* @param {Object|function} [options.filter] Either a Lodash match expression or a function to run on each widget - only truthy values are appended to the output. Function is called as `(widget, dataPath, specPath, depth)`
* @param {Object|function} [options.filterChildren] Either a Lodash match expression or a function to run on each widget - only truthy values are recursed into. Function is called as `(widget, dataPath, specPath, depth)`
* @param {string} [type="auto"] How to recurse into items. ENUM: 'auto' (try to determine how to recurse from root element), 'spec', 'data'
* @param {string} [want="object"] How to return the output. ENUM: 'object' (an object where each key is the path and the value is the object), 'array' (a flattened version of an object), object is faster
* @param {boolean|string} [wantDataPath=false] Whether to mutate the output widget with a dotted notation string indicating where to look in a data object for the value of the widget, if this is a string it specifies the key to use as storage
* @param {boolean} [wantSpec=false] Whether to mutate the output widget with the widget specification as an object for each item
* @param {boolean|string} [wantSpecPath=false] Whether to mutate the output widget with a dotted notation path on where to find the widget within a spec object, if this is a string it specifies the key to use as storage
*/
$macgyver.flatten = (root, options) => {
	var settings = _.defaults(options, {
		root: _.isArray(root) ? $macgyver.compileSpec(root).spec : root,
		maxDepth: 0,
		filter: undefined,
		filterChildren: undefined,
		type: 'auto',
		want: 'object',
		wantDataPath: false,
		wantSpec: false,
		wantSpecPath: false,
	});

	if (settings.filter && !_.isFunction(settings.filter) && _.isObject(settings.filter)) settings.filter = _.matches(settings.filter);
	if (settings.want != 'object' && settings.want != 'array') throw new Error('$macgyver.flatten({want}) can only be "object" or "array"');
	if (settings.type == 'auto') {
		if (settings.root && settings.root.items) {
			settings.type = 'spec';
		} else if (_.every(settings.root, (k, v) => !v.items)) {
			settings.type = 'data';
		} else {
			throw new Error('Cannot determine type of input object to $macgyver.flatten(), specify it explicitly with {type=spec|data}');
		}
	}

	var found = settings.want == 'object' ? {} : [];

	var depthScanner = (node, dataPath, specPath, depth) => {
		if (!_.isObject(node)) return;

		// Add to bucket of found objects?
		if (
			!settings.filter // No filter
			|| settings.filter.call(node, node, path, depth) // OR we pass the filter
		) {
			if (settings.wantDataPath) node[_.isString(settings.wantDataPath) ? settings.wantDataPath : 'path'] = dataPath.concat([node.id]).filter(i => i).join('.');
			if (settings.wantSpecPath) node[_.isString(settings.wantSpecPath) ? settings.wantSpecPath : 'specPath'] = specPath.join('.');

			if (settings.want == 'object') {
				if (node.id) found[node.id] = node;
			} else {
				found.push(node);
			}
		}

		// Recurse into children?
		var recursionSubject = settings.type == 'spec' ? node.items : node;

		if (
			_.isArray(recursionSubject)
			&& (
				!settings.filterChildren // No filter
				|| settings.filterChildren.call(node, node, dataPath, specPath, depth) // ...or we pass the filter
			)
			&& (!settings.maxDepth || depth <= settings.maxDepth)
		) {
			recursionSubject.forEach((item, itemIndex) =>
				depthScanner(item, dataPath, specPath.concat(settings.type == 'spec' ? ['items', itemIndex] : [itemIndex]), depth + 1)
			);
		}
	};
	depthScanner(settings.root, [], [], 0);

	return found;
};


/**
* Apply various criteria to a 'rough' spec to turn it into a clean one
*
* NOTE: 'Shorthand' is a simple `{id1: spec1, id2: spec2}` way of setting up a form. See the widget config for an example
*       Shorthand may also have types that omit the `mg` prefix e.g. `text` instead of `mgText`
*
* @param {Object|array} spec A MacGyver spec to process and mutate
* @param {Object} [options] Additional options to use
* @param {boolean} [options.clone=true] Whether to clone the object before neatening, slow but Vue disallows mutation
* @param {boolean} [options.convertArray=true] Convert arrays to object if not already in that format
* @param {function} [options.convertArrayWrapper] Function used to convert from array - defaults to a simple mgContainer wrapper. Called as (spec)
* @param {boolean} [options.convertShorthand=true] Accept shorthand format and convert if necessary
* @param {function} [options.convertShorthandDetect] Function used to detect shorthand format - defaults to object with valid string keys sans 'id' field. Called as (spec)
* @param {function} [options.convertShorthandTranslate] Function used to convert shorthand format. Called as (spec)
* @param {boolean} [options.widgetDefaults=true] Assign each item its default values from the widget config if that setting is omitted
* @param {string} [options.widgetTitles=true] Add any missing title fields from the ID
* @param {boolean} [options.deblank=true] Reformat null/undefined/empty forms into a skeleton form
* @returns {Object} An object composed of the keys {spec}
*/
$macgyver.compileSpec = (spec, options) => {
	var settings = {
		clone: true,
		convertArray: true,
		convertArrayWrapper: items => ({type: 'mgContainer', showTitles: false, items}),
		convertShorthand: true,
		convertShorthandDetect: spec =>
			_.isPlainObject(spec) // Simple object
			&& !_.has(spec, 'type') // It doesn't have a type key (i.e. there is only one item in this object
			&& _.every(spec, (v, k) => !_.has(v, 'id') && (!_.has(v, 'type') || v.type != 'mgContainer')), // Each item lacks an ID and either doesn't have a type or that type is not a container
		convertShorthandTranslate: spec => ({
			type: 'mgContainer',
			items: _.map(spec, (widget, id) => {
				if (_.isString(widget)) widget = {type: widget}; // Widget is a straight string (e.g. 'boolean'), then fall through to type finders

				if (widget.type?.startsWith('mg')) { // Already a defined MacGyver spec
					return widget;
				} else if (_.isString(id) && id.startsWith('mg')) { // ID is type, payload is widget
					return {...widget, type: id};
				} else if (widget.type) { // We have a type - try to match it against known widgets (or error out)
					var typeLCase = widget.type.toLowerCase();
					var found = _.find($macgyver.widgets, mgWidget => // Search for likely widgets
						mgWidget.meta.id.substr(2).toLowerCase() == typeLCase // matches `mg${TYPE}`
						|| mgWidget.meta.shorthand.includes(typeLCase) // is included in shorthand alternatives
					);
					if (found) { // Found either a widget of form `mg${type}` or a widget with that type as a shorthand
						return {id, ...widget, type: found.meta.id}
					} else { // No idea what this widget is, wrap in an mgError
						return {type: 'mgError', text: `Unknown widget type "${widget.type}": ` + JSON.stringify(widget, null, '\t')};
					}
				} else if (_.isPlainObject(widget)) { // Given object but it explicitly does not have a type - assume mgText
					return {id, ...widget, type: 'mgText'};
				} else { // Can't determine any type to link against - error out
					return {type: 'mgError', text: `No widget type specified: ` + JSON.stringify(widget, null, '\t')};
				}
			}),
		}),
		widgetDefaults: true,
		widgetTitles: true,
		deblank: true,
		...options,
	};

	var spec = settings.clone ? _.cloneDeep(spec) : spec; // Output spec

	if (settings.deblank && _.isEmpty(spec)) { // Convert empty or unusable values into a skeleton
		spec = {type: 'mgContainer', items: []};
	}
	if (settings.convertArray && _.isArray(spec)) { // convert array spec -> object?
		spec = settings.convertArrayWrapper(spec);
	}
	if (settings.convertShorthand && settings.convertShorthandDetect(spec)) { // Is shorthand format
		spec = settings.convertShorthandTranslate(spec);
	}

	/**
	* Collection of items that have a showIf property
	* @var {array<Object>} Each widget with a showIf property
	*/
	var showIfs = [];

	$macgyver.flatten(spec, {
		type: 'spec',
		want: 'array',
		wantDataPath: '$dataPath',
		wantSpecPath: '$specPath',
	})
		.forEach(widget => {
			if (!widget.type || !$macgyver.widgets[widget.type]) { // Remap unknown widget (we already did shorthand remapping above so this should be a 1:1 match)
				console.log(`Unknown widget '${widget.type}'`, widget);
				widget = {
					type: 'mgError',
					text: `Unknown widget type "${widget.type}": ` + JSON.stringify(widget),
				};
			} else if (settings.widgetDefaults) { // Apply defaults to widget
				Object.assign(widget, _.chain($macgyver.widgets[widget.type].config)
					.pickBy((v, k) => !_.has(widget, k) && _.has(v, 'default'))
					.mapValues(v => v.default)
					.value()
				);
			}

			// Glue .show property to all elements that omit it
			widget.show = widget.show == undefined ? true : !!widget.show;

			// Add all widgets with a .showIf expression into a quick-lookup collection
			if (widget.showIf) {
				widget.showIf = $macgyver.utils.evalCompile(widget.showIf); // Compile showIf property so its as fast as possible
				showIfs.push(widget);
			}

			if (settings.widgetTitles && !widget.title && widget.id) widget.title = _.startCase(widget.id);
		})

	return {spec, showIfs};
};


/**
* Register of known forms to their Vue instance / plain object mapping
* For front-end MacGyver this is the VueInstance object of the registered form
* For the back-end this is a simple object of the form `{config, data}`
* @var {VueInstance|Object>}
* @property {Object} config The form spec
* @property {Object} data The current form data
*/
$macgyver.$forms = {};


/**
* Set of misc utility helper functions
* @var {Object};
*/
$macgyver.utils = {};


/**
* Local storage for the global object
* This is a wrapper until `globalThis` becomes available in both Node and the browser
* @var {Object} The global scope
*/
$macgyver.utils.global = (()=> {
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
})();


/**
* Fetch any artbitrary data set from a URL
* This function is designed to accept a customizable single-string URL which the user can customize and a spec options object that the requesting widget can define
* NOTE: This function will invoke the loading notifier and call the warning notifier on an error
*
* @param {string} [url] The URL to fetch
* @param {Object} options Additional options
* @param {string} [options.url] Alternate way to pass the URL
* @param {boolean} [options.type='object'] What data type to expect from the server. ENUM: 'object', 'array', 'raw'. If array and mappings are specified each member of the collection is mapped and an array returned
* @param {function} [options.format] Data formatter, defaults to a simple passthrough. Called as `(output, session)`
* @param {string|function} [options.formatError] Error thrown if the formatter fails, can be a string or function called as `(err)`. Defaults to 'Unable to format data feed from ${url} - ${err.toString()}`
* @param {string} [options.from] The field from where to retrieve the value
*
* @param {Object <Object>} [options.mappings={}] Mappings to extract, each key is the mapping name with the value as an object containing the below spec
* @param {boolean} [options.mappings.required=false] Whether the mapping is required
*
* @returns {Object} The extracted data object
*
* @example Fetch a simple collection
* fetch('/api/datafeeds/random/users')
*
* @example Generate a random number as an object and return the extracted value as the promise response
* fetch('/api/datafeeds/random/number?$extract=number', {mappings: {extract: {required: true}, format: d => d.extract}});
*
* @example Fetch a collection of items extracting both 'id' and 'title' fields
* fetch('/api/datafeeds/random/users?$title=name&$id=_id', {mappings: {_id: {required: true}, title: {required: true}}})
*/
$macgyver.utils.fetch = (url, options) =>
	Promise.resolve()
		// Sanity checks {{{
		.then(()=> $macgyver.$http || Promise.reject('No Axios compatible HTTP library - set $macgyver.$http to the library reference'))
		// }}}
		// Injection options from URL {{{
		.then(()=> {
			if (_.isPlainObject(url)) {
				[url, options] = [url.url, url];
			} else {
				options.url = url;
			}
			if (!url) throw new Error('Unknown URL to fetch');
		})
		// }}}
		// Create the initial session {{{
		.then(()=> ({
			mappings: {}, // Parsed mappings (either a copy of settings.mappings || extracted from the URL)
			parsedUrl: new URL(url, window.location),
			settings: {
				type: 'object',
				mappings: {}, // Optional mappings the user provided
				format: (data, session) => data,
				formatError: err => `Unable to format data feed from ${url} - ${err.toString()}`,
				...options,
			},
		}))
		// }}}
		// Extract mappings from the URL string {{{
		.then(session => {
			if (!_.isEmpty(options.mappings)) { // Mappings are specified in options
				session.mappings = options.mappings;
			} else { // Try to extract mappings if options doesn't already have a parsed set
				Array.from(session.parsedUrl.searchParams.entries())
					.forEach(pair => {
						var [k, v] = pair;
						if (k.startsWith('$')) {
							session.mappings[k.substr(1)] = {required: false, from: v};
							session.parsedUrl.searchParams.delete(k);
						}
					});
			}

			return session;
		})
		// }}}
		// Make the request {{{
		.then(session =>
			$macgyver.$http.get(session.parsedUrl.toString())
				.then(res => session.response = res)
				.then(()=> session)
		)
		// }}}
		// Apply object cohersion + mappings {{{
		.then(session => {
			switch (session.settings.type) {
				case 'array':
					if (!_.isArray(session.response.data)) throw `Expected an array from data feed "${url}" but got a non-array`;
					if (!_.isEmpty(session.mappings)) {
						session.output = session.response.data.map((item, itemIndex) =>
							_.mapValues(session.mappings, (v, k) => {
								if (v.required && item[v.from] === undefined) throw new Error(`Required field ${v.from} is not present in data feed for item #${itemIndex+1}`);
								return item[v.from];
							})
						);
					} else {
						session.output = session.response.data;
					}
					return session;
				case 'object':
					if (!_.isPlainObject(session.response.data)) throw `Expected object return from data feed "${url}" but got a non-plain-object`;
					if (!_.isEmpty(session.mappings)) {
						session.output = _.mapValues(session.mappings, (v, k) => {
							if (v.required && session.response.data[k] === undefined) throw new Error(`Required field ${k} is not present in data feed for item #${itemIndex+1}`);
							return session.response.data[v.from];
						})
					} else {
						session.output = session.response.data;
					}
					return session;
				case 'raw':
					session.output = session.response.data;
					return session;
			}
		})
		// }}}
		// Apply formatter {{{
		.then(session => {
			try {
				return session.settings.format(session.output, session)
			} catch (err) {
				throw _.isString(session.settings.formatError)
					? session.settings.formatError
					: session.settings.formatError(err);
			}
		})
		// }}}
		.catch(err => {
			$macgyver.notify.error(err);
			throw err;
		})
		.finally(()=> $macgyver.notify.loading(url, false))


/**
* Attempt to parse a rough JS expression into a Sift / Mongo compatible expression
* This makes future calls to $macgyver.utils.evalMatch() much quicker
* TODO: This probably needs replacing / merging with [sift-shorthand](https://github.com/hash-bang/sift-shorthand) at some point
* @param {Object|string} expression Input expression, if this is an object it is assumed to already be a sift expression and returned uneffected
* @param {boolean} [asFunc=true] Return a Sift filtering function (the most efficient method), if falsy return the compiled object (useful for debugging)
* @returns {Sift} Sift function for use with $macgyver.utils.evalMatch()
*/
$macgyver.utils.evalCompile = (expression, asFunc = true) => {
	var match;
	if (_.isFunction(expression)) { // Already compiled Sift function
		if (!asFunc) throw new Error('Cannot convert compiled Sift object back to an object - disable asFunc parameter');
		return expression;
	} else if (_.isPlainObject(expression)) { // An object but not as Sift function
		return (asFunc ? sift(expression) : expression);
	} else if ((_.isString(expression)) && (match = /^\s*(?<left>[\w\d\.]+)(?<operand>\s*==?\s*|\s*\!=\s*|\s*<=?\s*|\s*>=?\s*|\s+\$lte?\s+|\s+\$gte?\s+)(?<right>.+)\s*$/.exec(expression))) { // Simple direct (in)equality e.g. `a == 1', `b != 'this'`
		match.groups.operand = match.groups.operand.trim();
		if (isFinite(match.groups.right)) {
			match.groups.right = +match.groups.right;
		} else if (/^(["']).*\1$/.test(match.groups.right)) { // Enclosed in " or '
			match.groups.right = match.groups.right.substr(1, match.groups.right.length - 2);
		}

		// Convert string to boolean
		if (_.isString(match.groups.right) && match.groups.right.toLowerCase() === 'true')
			match.groups.right = true;
		if (_.isString(match.groups.right) && match.groups.right.toLowerCase() === 'false')
			match.groups.right = false;

		var obj;
		if (['=', '==', '$eq'].includes(match.groups.operand)) { // Direct equality
			obj = {[match.groups.left]: match.groups.right};
		} else {
			var siftOperand =
				['!=', '$ne'].includes(match.groups.operand) ? '$ne'
				: ['>', '$gt'].includes(match.groups.operand) ? '$gt'
				: ['<', '$lt'].includes(match.groups.operand) ? '$lt'
				: ['>=', '$gte'].includes(match.groups.operand) ? '$gte'
				: ['<=', '$lte'].includes(match.groups.operand) ? '$lte'
				: (()=> {throw new Error(`Unknown operand "${match.groups.operand}" while parsing expression "${expression}"`)})()

			obj = {[match.groups.left]: {[siftOperand]: match.groups.right}};
		}

		return (asFunc ? sift(obj) : obj);
	} else {
		throw new Error(`Error parsinng expression "${expression}", $macgyver.utils.evalCompile() can only process simple expressions for now, use Sift object syntax for more complex tests`);
	}
};


/**
* Evaluate an expression and return if it matches the given environment
* This function is used by the `showIf` parameter to determine field visibility
* NOTE: Passing a string to this function is possible but its better to precompile the expression via $macgyver.utils.evalCompile() first so its quicker to process each time
* @param {string|Object|Sift} expression String expression (which will be parsed), object (which will be parsed) or Sift object to filter by in asending order of efficiency
* @param {Object} env Local environment to compare
*/
$macgyver.utils.evalMatch = (expression, env) => {
	return ([env].filter($macgyver.utils.evalCompile(expression))).length == 1;
};


/**
* Set a dotted notation or array path to a set value
* This function will correctly populate any missing entities, calling vm.$set on each traversal of the path
* Passing undefined as a value removes the key (unless removeUndefined is set to false)
* *
* @param {Object} [target] The target to set the path of, if omitted the `vm` object is used as the base for traversal
* @param {string|array} path The path to set within the target / vm
* @param {*} value The value to set
* @param {Object} [options] Additional options
* @param {boolean} [options.arrayNumeric=true] Process numeric path segments as arrays
* @param {boolean} [options.removeUndefined=true] If undefined is specified as a value the key is removed instead of being set
* @param {boolean} [options.debug=false] Also print out debugging information when setting the value
* @returns {Object} The set value, like $set()
*
* @example Set a deeply nested path within a target object
* $macgyver.utils.setPath(this, 'foo.bar.baz', 123); // this.$data.foo.bar.baz = 123
*
* @example Set a deeply nested path, with arrays, assuming VM as the root node
* $macgyver.utils.setPath('foo.1.bar', 123); // vm.$data.foo = [{bar: 123}]
*/
// FIXME: Duplication. Both this and "vue-setpath" should depend on a parent "setpath" package.
$macgyver.utils.setPath = (target, path, value, options) => {
	// Argument mangling {{{
	if (_.isString(target) || _.isArray(target) || value === undefined) { // called as (path, value)
		[target, path, value, options] = [this, target, path, value];
	} else if (!_.isObject(target)) {
		throw new Error('Cannot use $setPath on non-object target');
	}
	// }}}

	var settings = {
		arrayNumeric: true,
		debug: false,
		removeUndefined: true,
		...options,
	};

	if (settings.debug) console.debug('[$setPath]', path, '=', value, {target, options});

	var node = target;
	if (!path) throw new Error('Cannot $setPath with undefined path');
	(_.isString(path) ? path.split('.') : path).some((chunk, chunkIndex, chunks) => {
		if (chunkIndex == chunks.length - 1) { // Leaf node
			if (settings.removeUndefined && value === undefined) {
				$macgyver.utils.unset(node, chunk);
			} else {
				$macgyver.utils.set(node, chunk, value);
			}
		} else if (node[chunk] === undefined) { // This chunk (and all following chunks) does't exist - populate from here
			chunks.slice(chunkIndex, chunks.length - 1).forEach(chunk => {
				if (settings.arrayNumeric && isFinite(chunk)) {
					$macgyver.utils.set(node, chunk, []);
				} else {
					$macgyver.utils.set(node, chunk, {});
				}
				node = node[chunk];
			});
			$macgyver.utils.set(node, chunks[chunks.length - 1], value);
			return true;
		} else {
			node = node[chunk];
			return false;
		}
	});

	return value;
};


/**
* Mapping around Vue.set (if its available) or simple key/val setting
* @param {Object} target The target object to mutate
* @param {string} key The key to set
* @param {*} val The value to set
* @returns {*} The set value
*/
$macgyver.utils.set = $macgyver.utils.global.Vue ? Vue.set : (target, key, val) => target[key] = val;


/**
* Mapping around Vue.unset (if its available) or simple key delettion
* @param {Object} target The target object to mutate
* @param {string} key The key to remove
*/
$macgyver.utils.unset = $macgyver.utils.global.Vue ? Vue.unset : (target, key) => { delete target[key] };


/**
* Provides a function to quickly get a data path on a Vue component by its path
* This function is designed to work as simillaly as possible to _.get()
* @param {Object} target The source object, usually the root controller
* @param {string|array} path Either a path in dotted or array notation
* @param {*} [fallback=undefined] Optional fallback to return if no value is found
* @returns {*} Either the found value or the fallback
*/
$macgyver.utils.getPath = (target, path, fallback) => {
	return _.get(target, path, fallback);
};


/**
* Attempt to increment a string ID
* This is usually used when we have a base ID and want to duplicate the widget
* If ID is blank, blank is returned (assumes base parent also has no ID)
* @param {string} str The string to increment
* @returns {string} An incremented version of str
*/
$macgyver.utils.incrementId = str => {
	if (!str) {
		return str;
	} else if (/[0-9]$/.test(str)) { // Ends in a number
		var extracted = /^(?<prefix>.*)(?<numeric>[0-9]+)$/.exec(str); // Extract numeric suffix
		return extracted.groups.prefix + (parseInt(extracted.groups.prefix) + 1);
	} else { // No idea - just append '2'
		return str + '2';
	}
};


export default $macgyver;
