import MacGyver from './macgyver.js';

/**
* Main MacGyver plugin
* This service requires {$http, $toast} to be available on the prototype
* TODO: Bring in $http and $toast as plugin mixin?
* @var {Object}
*/
// TODO: Could use pattern like VueRouter and define a VueMacgyver Class.
export default {
	install: function (app, options) {
		var $macgyver = MacGyver;

		/**
		* Axios compatible HTTP fetcher
		* Optional binding unless anything requires web access
		* @var {Object}
		*/
		$macgyver.$http;


		/**
		* Doop compatible Prompt handler
		* @var {Object}
		*/
		$macgyver.$prompt;


		/**
		* Generic fallback action handler
		* @var {function} Called as `(action, params...)`
		i*/
		$macgyver.$eval = (...args) => console.warn('Fallback $macgyver.$eval(', ...args, ')');


		// Absorb various methods from a Vue prototype
		var vInstance = new app();
		['$on', '$off', '$once', '$emit'].forEach(method => $macgyver[method] = vInstance[method].bind(vInstance));


		// Auto-bind to Axios if its defined
		if ($macgyver.utils.global.axios) $macgyver.$http = $macgyver.utils.global.axios;

		$macgyver.mgComponent = app.mgComponent = function(name, component) {
			if ($macgyver.widgets[name]) throw new Error(`Cannot redeclare MacGyver component "${name}"`);
			if (!name.startsWith('mg')) throw new Error(`All MacGyver components must be prefixed with "mg", given "${name}"`);

			$macgyver.widgets[name] = {
				...component,
				meta: {
					id: _.camelCase(name),
					title: _.startCase(name),
					icon: 'far fa-rectangle-wide',
					category: 'Misc',
					preferId: false,
					shorthand: [],
					format: true,
					formatClass: '',
					...component.meta,
				},
			};

			var rewriteProp = (prop) => {
				var newProp = {
					...(prop.default ? {default: prop.default} : {}),
				};

				// FIXME: This needs putting into each mgComponent declaration for Vue validation
				// Convert prop type to Vue native instances {{{
				if (prop.vueType) {
					var propType = _.chain(prop.vueType)
						.castArray() // Splat into an array (even if its a simple string)
						.map(type => { // Map each item into the native type
							switch (type) {
								// String to type bindings (usually via vueType)
								case 'array': return Array;
								case 'boolean': return Boolean;
								case 'date': return Date;
								case 'number': return Number;
								case 'object': return Object;
								case 'string': return String;
								case 'any': return; // Do not append type checking
								default:
									console.warn(`Unknown vueType JS primative "${type}" while declaring component "${name}" - assuming "string"`);
									return String;
							}
						})
						.filter()
						.thru(v => v.length < 2 ? v[0] : v) // Flatten 1 item arrays into its native type
						.value()

					if (propType) newProp.type = propType; // Only allocate type if there is one (i.e. ignore 'any' types)
				} else {
					switch (prop.type) {
						case 'mgText':
						case 'mgChoiceAutocomplete':
						case 'mgChoiceButtons':
						case 'mgChoiceDropdown':
						case 'mgChoiceRadio':
						case 'mgChoiceTree':
						case 'mgCode':
						case 'mgColor':
						case 'mgEmail':
						case 'mgHtml':
						case 'mgIcon':
						case 'mgPassword':
						case 'mgRestQuery':
						case 'mgTextArea':
						case 'mgUnknown':
						case 'mgUrl':
						case 'mgWysiwyg':
							newProp.type = String;
							break;
						case 'mgNumber':
							newProp.type = Number;
							break;
						case 'mgChoiceCheckbox':
						case 'mgToggle':
							newProp.type = Boolean;
							break;
						case 'mgChoiceList':
						case 'mgChoiceTags':
						case 'mgList':
						case 'mgTable':
							newProp.type = Array;
							break;
						case 'mgQuery':
							newProp.type = Object;
						case 'mgDate':
						case 'mgDatetime':
						case 'mgTime':
							newProp.type = Date;
							break;
						case Number:
						case String:
						case Array:
						case Object:
						case Date:
							console.warn('Used native binding in component prop (e.g. `{type: Array}`). Always use mg* component types so these components are editable in the mgFormEditor');
							newProp.type = prop.type; // Native Vue types
							break;
						case Function:
							console.warn('Used native binding in component prop (e.g. `{type: Function}`). Always use mg* component types so these components are editable in the mgFormEditor');
							newProp.type = Function;
							break;
						default:
							console.warn(`Unknown primative mapping of prop type "${prop.type}" while declaring component "${name}" - assuming "String"`);
							newProp.type = String;
					}
				}
				// }}}

				return newProp;
			};

			// Rewrite MacGyver props inside mixins into Vue compatible props
			if (component.mixins) component.mixins.forEach(m => m.props = _.mapValues(m.props, rewriteProp));

			var vueComponent = {
				inject: component.inject || ['$mgForm'], // Defer to component injects or default to injecting $mgForm
				data() { return {
					data: undefined,
					...(component.data ? component.data() : {}), // Import other data definitions from the object
				}},
				props: {
					$type: {type: String, default: name},
					$dataPath: {type: String},
					$specPath: {type: String},
					// FIXME: Having a `change` property conflicts with event handlers called `change`.
					change: {type: Function},
					value: {},
					..._.mapValues(component.props || {}, rewriteProp), // Rewrite MacGyver props into Vue compatible props
				},
				methods: {
					mgSetup() {
						// Setup event listners {{{
						this.$on('mgIdentify', reply => reply(this));
						// }}}

						// Read in initial data value {{{
						var refresher = ()=> {
							// FIXME: Match empty strings also?
							if (this.$props.value) { // Standalone value
								this.data = _.clone(this.$props.value);
							} else if (this.$props.$dataPath) { // Has a data path
								this.data = _.get(this.$mgForm.formData, this.$props.$dataPath);
							} else if (this.$props.default) { // Has a default
								this.data = _.clone(this.$props.default);
							}
						};

						this.$on('mgRefresh', refresher);
						this.$on('mgRefreshForm', refresher);

						refresher();
						// }}}

						// Data watcher which transforms change operations into emitters to the nearest parent form {{{
						this.$watch('data', value => {
							// Emit `mgChange` to form element (if there is a parent form)
							// FIXME: Skip when this.$props.value is defined?
							if (this.$mgForm && this.$props.$dataPath)
								this.$mgForm.$emit('mgChange', {path: this.$props.$dataPath, value});

							// Emit regular `change` event
							this.$emit('change', value);

							// Is there a prop attached which monitors change?
							// FIXME: Having a `change` property conflicts with event handlers called `change`.
							// FIXME: Use `call` with a context?
							if (this.$props.change) this.$props.change(value);
						}, {deep: true});
						// }}}
					},

					...component.methods,
				},
				created() {
					this.mgSetup();
					if (component.created) return component.created.call(this); // Call components own created() method if there is one
				},
				..._.omit(component, [ // Import remaining Vue properties that are not explicitly merged in above
					'inject',
					'data',
					'props',
					'methods',
					'created',
				]),
			};

			return app.component(name, vueComponent);
		};

		app.prototype.$macgyver = $macgyver;

		// TODO: Vue3
		//app.provide('macgyver', options)

	}
};
