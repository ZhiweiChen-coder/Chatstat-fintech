<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgForm').enable(false);

import _ from 'lodash';

/**
* The top level MacGyver form
* @param {string} [form] Unique form name
* @param {Object|Array} config The MacGyver form object either in long form nested array structure or short form object (which is converted)
* @param {boolean} [populateDefaults=true] Apply initial defaults to the data when the config is ready, if false you can call vm.assignDefaults() manually if needed
* @param {boolean} [actionsFallback=true] Use vm.$eval as a runner when no action listener is found
* @param {Object|function} [actions] Actions subscribers as an object as a lookup list of action definition string keys and their firable function. Subscriber functions are called with the context as `(...params)`. If the value is a function it is called as the raw contents of the action.
* @param {Object} [data] The data binding
*
* @emits change Emitted as `(data)` whenever any data changes
* @emits changeItem Emitted as `({path, value})` when any single item changes
* @emits onAction Emitted as `({action, params})` when any action is fired
* @emits mgComponent.click Emitted as `(component, event)` on native clicks of a component
* @emits mgComponent.mouseDown Emitted as `(component, event)` on the native mouseDown event of a component
* @emits mgComponent.mouseUp Emitted as `(component, event)` on the native mouseUp event of a component
* @emits mgComponent.mouseMove Emitted as `(component, event)` on the native mouseMove event of a component
* @emits mgComponent.mouseEnter Emitted as `(component, event)` on the native mouseEnter event of a component
* @emits mgComponent.mouseLeave Emitted as `(component, event)` on the native mouseLeave event of a component
* @emits mgComponent.mouseOver Emitted as `(component, event)` on the native mouseOver event of a component
* @emits mgComponent.mouseOut Emitted as `(component, event)` on the native mouseOut event of a component
* @emits mgContainer.click Emitted as `(container, specPath, event)` on the native click event of a component within a container
* @emits mgContainer.mouseEnter Emitted as `(container, specPath, event)` on the native mouseEnter event of a component within a container
* @emits mgContainer.mouseLeave Emitted as `(container, specPath, event)` on the native mouseLeave event of a component within a container
*/
export default app.component('mgForm', {
	provide() { return {
		$mgForm: this,
	}},
	data() { return {
		id: undefined, // Set on create
		editing: false, // Set by mgFormEditor when its this components parent
		errors: [], // array <Object> {error}
		spec: undefined, // Calculated version of config after its been though $macgyver.compileSpec()
		formData: {}, // Calculated version of $props.data after default population
		inRefresh: false, // Whether we are doing a refresh from the top-down, prevents recursive refreshing
	}},
	props: {
		form: String, // Optional overriding form ID
		config: [Object, Array], // Can be a single object, array of objects or shorthand style
		data: Object,

		populateDefaults: {type: Boolean, default: true},
		onAction: Function,
		actionsFallback: {type: Boolean, default: true},
		actions: { // Object of functions e.g. `{customFunc: ()=> {}}`
			type: [Function, Object],
			validator: v => _.isFunction(v) || _.every(v => _.isFunction(v)),
		},
	},
	created() {
		this.id = this.id || this.$props.form || this.$macgyver.nextId();
	},
	mounted() {
		this.$watch('$props.config', ()=> {
			// console.log('mgForm config clobber', this.id, JSON.parse(JSON.stringify(this.$props.config)));
			this.rebuild();
		}, {immediate: true, deep: true});

		this.$watch('$props.data', ()=> {
			// console.log('mgForm data clobber', this.id, JSON.parse(JSON.stringify(this.$props.config)));
			this.rebuildData();
		}, {immediate: true, deep: true});

		this.$on('mgChange', data => {
			if (this.inRefresh) return;
			this.$macgyver.utils.setPath(this.formData, data.path, data.value);
			this.$emit('changeItem', data);

			this.$emit('change', {...this.formData}); // Has to be a shallow clone so we break the reference and Vue updates
			this.refreshShowIfs();
		});

		this.$on('mgErrors', errors => this.errors = errors);
		// this.$on('mgForm.rebuild', ()=> this.rebuild()); // FIXME: Needed after new mgForm config clobber detection?
	},
	methods: {
		/**
		* Force the form to rebuild its config
		*/
		rebuild() {
			this.id = this.id || this.$props.form || this.$macgyver.nextId();
			// console.log(`Rebuild form config for form "${this.id}"`);

			this.spec = this.$macgyver.compileSpec(this.$props.config);
			if (!this.spec || !this.spec.spec) throw new Error('Invalid Macgyver form spec');
		},


		/**
		* Force the form to rebuild its data set
		*/
		rebuildData() {
			if (this.inRefresh) return;
			this.inRefresh = true;

			this.formData = this.$props.data ? _.cloneDeep(this.$props.data) : {};

			if (this.$props.populateDefaults) this.assignDefaults();
			this.refreshShowIfs();
			this.$emit.down('mgRefreshForm');
			this.$nextTick(()=> // Wait one tick for all attempts to recall this function recursively to exhaust
				this.inRefresh = false
			);
		},


		/**
		* Force recomputation of show via showIf values
		*/
		// FIXME: Fails on items nested within an mgTable.items array?
		refreshShowIfs() {
			if (!this.spec) return;
			this.spec.showIfs.forEach(widget =>
				widget.show = this.$macgyver.utils.evalMatch(widget.showIf, this.formData)
			);
		},


		/**
		* Assign initial defaults if a value is not in the data object
		*/
		assignDefaults() {
			if (!this.spec) return;
			_.defaultsDeep(this.formData, this.getPrototype());
			this.$emit('change', this.formData);
		},


		/**
		* Compute the data prototype of the form
		* This is an empty object with all the defaults populated
		* @returns {Object} A prototype data object with all defaults populated
		* @see $macgyver.forms.getPrototype()
		*/
		getPrototype() {
			if (!this.id) return {}; // Form not yet ready
			return this.$macgyver.forms.getPrototype(this.spec.spec);
		},


		/**
		* Execute a function within a form
		* The default behaviour of this function is documented within the function
		* @param {string|function} action The action(s) to execute
		* @param {*} [context] The context of the action, defaults to the form component
		* @param {*} [params...] Additional parameters to execute
		* @emits mgRun Event fired at the form level only with a single object of the form `{action, params}`. Use the form property handleActions to specify if the form should handle or trap the event to override
		*/
		run(action, context, ...params) {
			// 0. See if what we've been passed is already a function {{{
			if (typeof action == 'function') {
				return action.call(context ?? this);
			}
			// }}}

			// 1. Emit mgRun to parents and see if they want to handle it {{{
			var handled = false;
			this.$emit.up.call(context ?? this, 'mgRun', {action, params}, isHandled => {
				if (isHandled) handled = true;
			});
			if (handled) return;
			// }}}

			// 2. Use FORM.$props.onAction(action) and see if returns truthy {{{
			if (this.$props.onAction && this.$props.onAction.call(context ?? this, action, ...params)) return;
			// }}}

			// 3a. Does FORM.$props.actions exist and is a function which will handle everything? {{{
			if (this.$props.actions && _.isFunction(this.$props.actions)) {
				this.$props.actions.call(context ?? this, action);
				return;
			}
			// }}}

			// 3b. Does FORM.$props.actions[action] exist and if so whether it returns truthy {{{
			var [junk, actionReadable, actionArgs] = /^([a-z0-9\_]*?)(\(.*\))?$/i.exec(action) || [];
			if (actionReadable && this.$props.actions && this.$props.actions[actionReadable]) {
				// Collapse strings to functions
				var func = _.isString(this.$props.actions[actionReadable]) ? this[actionReadable]
					: this.$props.actions[actionReadable];

				// Tidy up actionArgs
				actionArgs = (actionArgs || '')
					.replace(/^\(/, '') // Remove preceeding '('
					.replace(/\)$/, '') // Remove succeeding ')'
					.split(',')
					.map(i => i && JSON.parse(i.replace(/'/g, '"')));

				if (func.call(context ?? this, ...actionArgs, ...params)) return;
			}
			// }}}

			// 4. If all else failed and FORM.$props.actionsFallback is true - handle it via vm.$eval {{{
			this.$macgyver.$eval.call(context ?? this, action, ...params);
			// }}}
		},


		/**
		* Find a VueComponent instance from a specPath
		* @param {string|array} specPath The specPath to search for
		* @param {boolean} [throws=true] Throw an error if the path cannot be found (avoid downstream checking if the specPath is valid)
		* @returns {VueComponent} Either the found VueComponent or `false` if not found
		*/
		getComponentBySpecPath(specPath, throws = true) {
			var found = false;
			this.$emit.down('mgIdentify', widget => {
				if (!found && widget.$props.$specPath == specPath)
					found = widget;
			});
			if (!found && throws) throw new Error(`Cannot edit component by non-existant specPath "${specPath}"`);
			return found;
		},


		/**
		* Query all child elements and update the array of errors (if any)
		* @returns {Boolean} A boolean indicating if the form validated
		*/
		validate() {
			const newErrors = [];

			this.$emit.down('mgValidate', res => {
				console.log('mgValidate response', res);
				typeof res == 'string' ? newErrors.push(res)
				: Array.isArray(res) ? newErrors = newErrors.concat(res)
				: (()=> { console.warn('Got error response', res); throw new Error(`Unhandled error response from component, see console`) })()
			});

			this.errors = newErrors;
			return (this.errors.length == 0);
		},
	},
});
</script>

<template>
	<form class="mg-form">
		<div v-if="errors.length" class="alert alert-warning">
			<ul>
				<li v-for="err in errors">{{err.error}}</li>
			</ul>
		</div>

		<mg-component
			v-if="spec"
			:config="spec.spec"
		/>
	</form>
</template>

<style>
/* Add missing Bootstrap color variables */
.mg-form {
	--btn-default-bg: #e9ecef;
	--btn-default-fg: #495057;
}
</style>
