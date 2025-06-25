<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgFormEditor').enable(true);

import _ from 'lodash';
import './mgFormEditorControls';

/**
* mg-form-editor - Drag-and-drop form designer for MacGyver
*
* @param {Object|Array} config mgForm compatible spec to edit
* @param {Object} [data] Optional data bindings for the form
* @param {array<Object>} [verbs] Verb edit mgForm to show in the small edit sidebar, defaults to selecting widgets / adding widgets buttons
* @param {string} [asideClassActive="mgfe-aside aside-right open"] Class to set all editing sidebars to when inactive
* @param {string} [asideClassInactive="mgfe-aside aside-right"] Class to set all editing sidebar to when inactive
* @param {string} [asideClassModeCollapsed="aside-sm"] Class to associate with the smaller toolkit display when editing
* @param {string} [asideClassModeToc="aside-sm"] Class to associate with the Table-Of-Contents sidebar
* @param {string} [asideClassModeAdding=""] Class to associate with the editing sidebar when adding
* @param {string} [asideClassModeEditing=""] Class to associate with the editing sidebar when editing
*
* @emits change Emitted as `(config)` on any item configuration change. WARNING, subscribing to this involves an entire deep copy of the config structure, subscribe to changeItem if possible
* @emits changeItem Emitted as `({path, value})` when a single config item changes, inexpensive compared to `change`
*/
export default app.component('mgFormEditor', {
	provide() { return {
		$mgFormEditor: this,
	}},
	data() { return {
		mode: 'collapsed', // ENUM: collapsed, toc, editing, adding
		id: this.$macgyver.nextId(), // ID of the editing form item
		editing: undefined, // The active item we are editing
		widgetListMode: 'grid',

		// Asides
		editConfig: [],
		editData: {},

		addTarget: undefined, // Spec path to add after, if any
		addOrientation: 'after',
	}},
	props: {
		// FIXME: Does not like array type specs.
		config: [Object, Array], // Can be a single object, array of objects or shorthand style
		data: Object,
		asideClassActive: {type: String, default: 'mgfe-aside aside-right open'},
		asideClassInactive: {type: String, default: 'mgfe-aside aside-right'},
		asideClassModeCollapsed: {type: String, default: 'aside-sm'},
		asideClassModeToc: {type: String, default: ''},
		asideClassModeAdding: {type: String, default: ''},
		asideClassModeEditing: {type: String, default: ''},
		generalVerbs: {
			type: Array,
			default() {
				return [
					{
						type: 'mgButton',
						action: "setMode()",
						class: 'btn btn-primary text-white px-2',
						icon: 'fa fa-mouse-pointer fa-fw',
						showTitle: false,
						// FIXME: Why were tooltips failing as Object type?
						tooltip: 'Select widgets to edit',
						//tooltip: "{content: 'Select widgets to edit', placement: 'left'}",
					},
					{
						type: 'mgButton',
						action: "setMode('toc')",
						class: 'btn btn-outline-light border-0 px-2',
						icon: 'fa fa-stream fa-fw',
						showTitle: false,
						tooltip: 'Select widgets to edit',
						//tooltip: {content: 'Select widgets to edit', placement: 'left'},
					},
					...(this.$prompt?.macgyver ? [{ // Include JSON editing if $prompt.macgyver() is available
						type: 'mgButton',
						action: "rawEdit()",
						class: 'btn btn-outline-light border-0 px-2',
						icon: 'fa fa-code fa-fw',
						showTitle: false,
						tooltip: 'Edit the form contents as JSON',
						//tooltip: {content: 'Edit the form contents as JSON', placement: 'left'},
					}] : []),
					{
						type: 'mgButton',
						action: "setMode('adding')",
						class: 'btn btn-outline-light border-0 px-2',
						icon: 'far fa-plus fa-fw',
						showTitle: false,
						tooltip: 'Add a new widget',
						//tooltip: {content: 'Add a new widget', placement: 'left'},
					},
				];
			},
		},
	},
	mounted() {
		$debug('$refs', this.$refs);
		/*
		// Potential for highlighting components within nested mgContainer
		this.$refs.form.$on('mgComponent.click', (component, e) => {
			e.stopPropagation();
			e.preventDefault();
			this.editWidget(component.config.$specPath);
		});

		this.$refs.form.$on('mgComponent.mouseEnter', (component, e) => {
			if (component.config.type === 'mgContainer') return;
			e.stopPropagation();
			//e.preventDefault();
			var target = this.$refs.form.getComponentBySpecPath(component.config.$specPath);
			//if (target.$type === 'mgContainer') return;
			// FIXME: Always 2 parents up? Traverse up to next highest mgContainer?
			var container = target.$parent.$parent;
			if (!container) return;
			var targetIndex = container.findChildIndex(target);
			container.$set(container.highlights, targetIndex, (container.highlights[targetIndex] || []).concat(['editHover']));
		});

		this.$refs.form.$on('mgComponent.mouseLeave', (component, e) => {
			if (component.config.type === 'mgContainer') return;
			e.stopPropagation();
			//e.preventDefault();
			var target = this.$refs.form.getComponentBySpecPath(component.config.$specPath);
			//if (target.$type === 'mgContainer') return;
			// FIXME: Always 2 parents up? Traverse up to next highest mgContainer?
			var container = target.$parent.$parent;
			if (!container) return;
			var targetIndex = container.findChildIndex(target);
			container.$set(container.highlights, targetIndex, (container.highlights[targetIndex] || []).filter(c => c != 'editHover'));
		});
		*/

		// FIXME: (e.target).closest... mg-container CSS class...
		this.$refs.form.$on('mgContainer.click', (container, specPath, componentIndex, e) => {
			e.stopPropagation();
			e.preventDefault();
			this.editWidget(specPath);
		});

		this.$refs.form.$on('mgContainer.mouseEnter', (container, specPath, componentIndex, e) => {
			var component = this.$refs.form.getComponentBySpecPath(specPath);
			var componentIndex = container.findChildIndex(component);
			container.$set(container.highlights, componentIndex, (container.highlights[componentIndex] || []).concat(['editHover']));
		});

		this.$refs.form.$on('mgContainer.mouseLeave', (container, specPath, componentIndex, e) => {
			var component = this.$refs.form.getComponentBySpecPath(specPath);
			var componentIndex = container.findChildIndex(component);
			container.$set(container.highlights, componentIndex, (container.highlights[componentIndex] || []).filter(c => c != 'editHover'));
		});
	},
	methods: {
		/**
		* Stop editing / adding and return to regular mode
		* @param {string} [mode="collapsed"] Mode to switch to
		* @param {boolean} [clearHighlight=true] Also attempt to clear out any highlight and reset the aside panes
		*/
		setMode(mode = 'collapsed', clearHighlight = true) {
			// Deselect the existing item (if we have one)
			if (this.editing && clearHighlight) {
				this.setComponentHighlight(this.editing, []);
				this.editing = undefined;
			}

			this.$set(this, 'mode', mode || 'collapsed');
			return true; // Signal to mgForm that we have handled this action
		},


		/**
		* Delete the active widget
		*/
		deleteWidget() {
			if (!this.editing) {
				this.$macgyver.notify.warn('No widget selected to delete'); // Not editing anyway
			} else {
				this.removeWidget(this.editing.$props.$specPath);
			}

			return true; // Signal to mgForm that we have handled this action
		},


		/**
		* Set the component.highlight[index] to the given list of CSS classes
		* @param {VueController} component The VueController to set the highlight of within its mgContainer
		* @param {array<string>} classes Array of string classes to set
		*/
		setComponentHighlight(component, classes) {
			if (!_.isArray(classes)) throw new Error('setComponentHighlight must be passed an array');

			var container = false;
			component.$emit.up('mgIdentify', component => {
				if (!container && component.$props.$type == 'mgContainer') container = component;
			});
			if (!container) return console.warn('[mgFormEditor] setComponentHighlight component failed to find enclosing container', {component});

			var childOffset = container.findChildIndex(component);
			if (childOffset === false) return console.warn('[mgFormEditor]', 'Cannot locate component within container', {container, component});

			console.log('Set highlight', childOffset, classes);
			container.$set(container.highlights, childOffset, classes);
		},


		/**
		* Edit a widget by its specPath or component
		* @param {VueComponent|string} component Either the VueComponent to edit or the specPath of the widget to edit
		*/
		editWidget(component) {
			var component; // The Vue component from the widget path
			if (!_.isObject(component) && !_.isString(component)) throw new Error('editWidget requires either a specPath or VueComponent');
			if (_.isObject(component) && !component._uid) throw new Error('editWidget() requires a valid VueComponent object (or specPath string)');

			if (_.isString(component) || _.isArray(component)) component = this.$refs.form.getComponentBySpecPath(component); // Resolve specPath into actual component if eneded

			this.setMode();

			this.$set(this, 'editing', component);
			this.$set(this, 'mode', 'editing');

			this.setComponentHighlight(component, ['editEditing']);

			var widget = this.$macgyver.widgets[component.$props.$type];
			if (widget) {
				this.$set(this, 'editConfig', [
					{ // Header area
						type: 'mgContainer',
						layout: 'columns',
						border: false,
						rowClass: 'aside-header',
						showTitle: false,
						items: [
							{id: 'metaIcon', type: 'mgIcon'},
							{id: 'id', type: 'mgText', placeholder: 'No ID'},
							{
								type: 'mgContainer',
								layout: 'columns',
								border: false,
								showTitle: false,
								rowClass: 'aside-actions',
								items: [
									{type: 'mgButton', action: 'deleteWidget', class: 'btn btn-link btn-link-danger btn-xs', icon: 'fas fa-trash', tooltip: 'Delete this widget'},
									{type: 'mgButton', action: 'setMode', text: '', class: 'btn btn-link btn-xs', icon: 'far fa-times'},
								],
							},
						],
					},
					{ // Body area
						type: 'mgContainer',
						layout: 'form',
						formClass: 'titles-above',
						rowClass: 'aside-body',
						showTitle: false,
						items: _.map(widget.props, (v, k) => _.set(v, 'id', k)),
					},
				]);
				$debug('Set editConfig', this.editConfig);

				this.$set(this, 'editData',
					_(widget.props)
						.mapValues((v, k) => _.get(component.$props, k, _.get(widget.props, k).default))
						.set('id', component.$props.$dataPath)
						.set('metaIcon', widget.meta.icon)
						.value()
				);
				$debug('Set editData', this.editData);
			} else {
				this.$macgyver.notify.warn(`Cannot edit unknown widget "${component.$props?.$type || 'Unknown type'}"`);
				this.setMode();
			}
		},


		/**
		* Change the value of a nested config path
		* @param {string} path The dotted / array notation path to mutate
		* @param {*} value The value to set, if undefined the key is removed
		* @emits change Emitted with the entire deep copied config object
		* @emits changeItem Emitted as `{path, value}` for a single item mutation
		*/
		mutatePath(path, value) {
			console.log('mutatePath', path, value);
			// Only bother cloning the entire object if something is listening to 'change'
			if (this.$emit.hasListeners('change')) {
				var configCopy = _.cloneDeep(this.config);
				this.$setPath(configCopy, path, value);
				this.$emit('change', configCopy);
			}

			this.$emit('changeItem', {path: path, value: value});
		},


		/**
		* Splice items into a deep copy of the config object, emitting change events
		* @param {string} path The dotted / array notation path to mutate
		* @param {number} index The index to work from
		* @param {number} [remove] The number of items to remove
		* @param {*} [value...] The value(s) to set, if undefined the key is removed
		* @emits change Emitted with the entire deep copied config object
		* @emits changeItem Emitted as `{path, value}` for a single item mutation
		*/
		mutateSplice(path, index, remove, ...value) {
			console.log('mutateSplice', path, index, remove);
			var configCopy = _.cloneDeep(this.config); // Copy entire object
			var spliceContents = _.get(configCopy, path); // Extract path from nested object
			if (!_.isArray(spliceContents)) throw new Error('Refusing to splice a non-array');
			spliceContents.splice(index, remove, ...value); // Perform splice

			this.$setPath(configCopy, path, spliceContents); // Place back in mutated object

			this.$emit('change', configCopy);
			this.$emit('changeItem', {path: path, value: spliceContents});
		},


		/**
		* Insert a widget at a given path
		* @param {Object} widget The widget to insert, this must contain at least a `type` key
		* @param {Object} [options] Additional options
		* @param {string|array} [options.specPath] The lodash notation specPath to target instead of the last element on the form
		* @param {string} [options.orientation='after'] Where to insert. ENUM: 'before', 'after', 'last'
		* @param {boolean} [options.useContainer=true] If no spec path, try and fit the new widget within the last container if one exists
		* @param {boolean} [options.allocateTitle=true] Try to allocate a title if not supplied
		* @param {boolean} [options.allocateId=true] Try to allocate an ID if not supplied and the widget has `preferId`
		* @param {boolean} [options.edit=true] Show the edit dialog after inserting the component
		* @returns {Object} The inserted widget object (complete with ID if allocateId is specified)
		*/
		insertWidget(widget, options) {
			console.log('insertWidget', widget, options);
			var settings = {
				specPath: undefined,
				orientation: 'after',
				useContainer: true,
				allocateTitle: true,
				allocateId: true,
				edit: true,
				...options,
			};

			if (!widget.type) throw new Error('Widget.type must be specified as a minimum for insertWidget()');

			// Ensure containers have items
			if (widget.type === 'mgContainer' && !widget.items) widget.items = [];

			// options.allocateTitle / settings.alloacteId {{{
			if ( // A field we want is missing
				(settings.allocateTitle && !widget.title)
				|| (settings.allocateId && !widget.id)
			) {
				// Compute how many of this widget are on the form
				var widgetOffset = this.$macgyver
					.flatten(this.$props.config, {want: 'array', type: 'spec'})
					.reduce((i, w) => w.type == widget.type ? i + 1 : i, 0);

				if (settings.allocateTitle && !widget.title)
					widget.title = this.$macgyver.widgets[widget.type].meta.title
						+ String(widgetOffset == 0 ? '' : widgetOffset);

				// Guess at an ID
				if (settings.allocateId && !widget.id && this.$macgyver.widgets[widget.type].meta.preferId)
					widget.id = _.chain(widget.type)
						.replace(/^mg/, '') // Remove first `mg` bit
						.camelCase()
						.replace(/$/, widgetOffset == 0 ? '' : widgetOffset) // Append numeric offset (if there is more than one of this type)
						.value();
			}
			// }}}

			// FIXME: Support for array specs without a root mgContainer.
			switch (settings.orientation) {
				case 'last':
					if ( // Container -> Container:Last -> New widget
						settings.useContainer // Insert within container?
						&& this.config.type == 'mgContainer' // First item is a container
						&& _.last(this.config.items)?.type == 'mgContainer' // Last child is also a container - use this
					) {
						this.mutateSplice(`items.${this.config.items.length - 1}.items`, _.last(this.config.items)?.items.length || 0, 0, widget);
					} else if ( // Container:Last -> New widget
						settings.useContainer // Insert within container?
						&& this.config.type == 'mgContainer' // First item is a container
					) {
						this.mutateSplice('items', this.config.items.length, 0, widget);
					} else if (_.isArray(this.config)) { // Append to end of config array
						this.mutateSplice('', this.config.items.length, 0, widget);
					} else {
						throw new Error('Dont know how to append widget to form config');
					}
					break;
				case 'before':
				case 'after':
					if (!settings.specPath) throw new Error('Inserting with orientations before / after requires a specPath');
					var parentItems = _.isArray(settings.specPath) ? settings.specPath : settings.specPath.split('.');
					var targetWidget = parentItems.pop();

					this.mutateSplice(
						parentItems,
						settings.orientation == 'after' ? +targetWidget + 1 : targetWidget,
						0,
						widget
					);
					break;
				default:
					throw new Error(`Dont know how to handle insert of component at with orientation "${settings.orientation}"`);
			}

			if (settings.edit) {
				console.warn('FIXME: Unsupported post edit when editing components');
				// this.editWidget(widget.id);
			}

			return widget;
		},


		/**
		* Remove a widget by its specPath
		* @param {string|array} specPath The lodash notation specPath to remove
		*/
		removeWidget(specPath) {
			this.setMode(); // Reset mode to close edit panel

			// FIXME: Splitting non-array, condition backwards?
			var parentItems = _.isArray(specPath) ? specPath : specPath.split('.');
			var targetIndex = parentItems.pop();

			this.mutateSplice(parentItems, targetIndex, 1);
		},


		/**
		* Duplicate a widget by its specPath
		* @param {string|array} specPath The lodash notation specPath to remove
		*/
		duplicateWidget(specPath) {
			var parentItems = _.isArray(specPath) ? specPath : specPath.split('.');
			var targetIndex = parentItems.pop();

			this.setMode(); // Reset mode to close edit panel
			this.mutatePath(
				parentItems,
				_(_.get(this.config, parentItems))
					.map((v, i) => i == targetIndex // Duplicate this item when we find its index
						? [
							v, // Original object
							_.chain(v)
								.cloneDeep()
								.pickBy((v, k) => !k.startsWith('$'))
								.set('id', this.$macgyver.utils.incrementId(v.id)) // Also increment its ID
								.value(),
						]
						: v
					)
					.flatten()
					.value()
			);
		},


		/**
		* Move a widget in a given direction
		* @param {string|array} specPath The lodash notation SpecPath to move
		* @param {string} direction The direction to move. ENUM: 'up', 'down'
		*/
		moveWidget(specPath, direction) {
			if (!['up', 'down'].includes(direction)) throw new Error('Unsupported direction');

			var parentItems = _.isArray(specPath) ? specPath : specPath.split('.');
			var targetIndex = parentItems.pop();

			this.setMode(); // Reset mode to close edit panel
			this.mutatePath(
				parentItems,
				_.chain(_.get(this.config, parentItems))
					.clone()
					.thru(v => {
						targetIndex = +targetIndex; // Splat into number
						if (direction == 'up' && targetIndex > 0) {
							[v[targetIndex], v[targetIndex-1]]
							=
							[v[targetIndex-1], v[targetIndex]]
						} else if (direction == 'down' && targetIndex < v.length) {
							console.log('SWAP', targetIndex, targetIndex + 1);
							[v[targetIndex], v[targetIndex+1]]
							=
							[v[targetIndex+1], v[targetIndex]]
						}
						return v;
					})
					.value()
			);
		},


		/**
		* Begin drag sequence for a widget
		* @param {string|array} specPath The lodash notation SpecPath to drag
		*/
		dragWidget(specPath) {
			console.warn('FIXME: dragWidget() not yet supported');
		},


		rawEdit() {
			this.$prompt.macgyver({
				title: 'Template JSON',
				macgyver: {
					id: 'code',
					type: 'mgCode',
					syntax: 'json',
					convert: true,
					default: this.$props.config,
				},
			}).then(form => this.$set(this, 'config', form.code))
		},


		// Form layouts {{{
		/**
		* Generate the config layout for the Table-Of-Contents sidebar
		*/
		generateConfigToc() {
			var genTreeBranch = root =>
				root.map(widget => ({
					title: `${widget.type} #${widget.id}`,
					icon: this.$macgyver.widgets[widget.type].icon,
					enum: widget.items ? genTreeBranch(widget.items) : undefined,
				}));

			return [
				{ // Header area
					type: 'mgContainer',
					layout: 'columns',
					border: false,
					rowClass: 'aside-header',
					showTitle: false,
					items: [
						{type: 'mgHeading', text: 'Form layout'},
						{
							type: 'mgContainer',
							layout: 'columns',
							border: false,
							showTitle: false,
							rowClass: 'aside-actions',
							items: [
								{type: 'mgButton', action: 'setMode', text: '', class: 'btn btn-link btn-xs', icon: 'far fa-times'},
							],
						},
					],
				},
				{ // Body area
					type: 'mgContainer',
					layout: 'form',
					rowClass: 'aside-body',
					showTitles: false,
					items: [
						{
							type: 'mgChoiceTree',
							title: 'Layout tree',
							change: item => {
								console.log('TREE CLICK', item);
							},
							enum: genTreeBranch(
								[ this.$macgyver.compileSpec(this.$props.config, {clone: false}).spec ]
							),
						},
					],
				},
			];
		},


		/**
		* Generate the config layout for the "add widget" sidebar
		*/
		generateConfigAdding() {
			return [
				{ // Header area
					type: 'mgContainer',
					layout: 'columns',
					border: false,
					rowClass: 'aside-header',
					showTitle: false,
					items: [
						{type: 'mgHeading', text: 'Add widget'},
						{
							type: 'mgContainer',
							layout: 'columns',
							border: false,
							showTitle: false,
							rowClass: 'aside-actions',
							items: [
								{type: 'mgButton', action: 'setMode', text: '', class: 'btn btn-link btn-xs', icon: 'far fa-times'},
							],
						},
					],
				},
				{ // Body area
					type: 'mgContainer',
					layout: 'form',
					rowClass: 'aside-body',
					showTitles: false,
					items: [
						{
							id: 'addType',
							type: 'mgChoiceList',
							title: 'Widget type to add',
							enum: _(this.$macgyver.widgets)
								.map((w, k) => ({
									id: k,
									title: w.meta.title,
									icon: `${w.meta.icon} fa-fw`,
								}))
								.sortBy('title')
								.value(),
							change: type => {
								var inserted = this.insertWidget({type}, {
									orientation: 'last',
									useContainer: true,
									edit: true,
								});
							},
						},
					],
				},
			];
		},
		// }}}
	},
});
</script>

<template>
	<div class="mg-form-editor">
		<!-- Aside collapsed mode {{{ -->
		<aside :class="[mode == 'collapsed' ? $props.asideClassActive : $props.asideClassInactive, $props.asideClassModeCollapsed]">
			<mg-form
				v-if="mode == 'collapsed'"
				:form="`${id}-collapsed`"
				:config="$props.generalVerbs"
				:actions="{setMode, rawEdit}"
			/>
		</aside>
		<!-- }}} -->
		<!-- Aside toc (table-of-contents) mode {{{ -->
		<aside :class="[mode == 'toc' ? $props.asideClassActive : $props.asideClassInactive, $props.asideClassModeToc]">
			<mg-form
				v-if="mode == 'toc'"
				:form="`${id}-toc`"
				:config="generateConfigToc()"
				:actions="{setMode}"
			/>
		</aside>
		<!-- }}} -->
		<!-- Aside widget library (add widget) {{{ -->
		<aside :class="[mode == 'adding' ? $props.asideClassActive : $props.asideClassInactive, $props.asideClassModeAdding]">
			<mg-form
				v-if="mode == 'adding'"
				ref="formAdd"
				:config="generateConfigAdding()"
				:actions="{setMode}"
			/>
		</aside>
		<!-- }}} -->
		<!-- Aside item editor (edit widget) {{{ -->
		<aside :class="[mode == 'editing' ? $props.asideClassActive : $props.asideClassInactive, $props.asideClassModeEditing]">
			<mg-form
				v-if="mode == 'editing'"
				:form="`${id}-edit`"
				:config="editConfig"
				:data="editData"
				:actions="{setMode, deleteWidget}"
				@changeItem="mutatePath(`${editing.$specPath}.${$event.path}`, $event.value)"
			/>
		</aside>
		<!-- }}} -->

		<!-- Display form {{{ -->
		<mg-form
			ref="form"
			:config="$props.config"
			:data="$props.data"
		/>
		<!-- }}} -->
	</div>
</template>

<style>
/* Variables {{{ */
:root {
	--mg-form-editor-selected-bg: #007bff;
	--mg-form-editor-selected-fg: #fff;;
	--mg-form-editor-selected-highlight: #5dabff;
	--mg-form-editor-selected-danger: #dc3545;
	--mg-form-editor-hover-bg: #77b9ff;
	--mg-form-editor-hover-fg: #fff;
}
/* }}} */

/* Aside styles - .mgfe-aside {{{ */
.mgfe-aside {
	transition: transform 0.2s ease-out;
}

.mgfe-aside .mg-form {
	margin: 0;
}

.mgfe-aside.aside-right.open.open { /* Silly hack to force the transform when open (overrides .asign-sm in priority) */
	transform: translateX(0px);
}

.mgfe-aside.aside-right {
	position: fixed;
	top: 0px;
	right: 0px;
	bottom: 0px;
	background: #FFF;
	z-index: 100;
	box-shadow: 0 1px 5px rgba(0,0,0,.3);
	width: 350px;
	transform: translateX(380px);
}

/* .mgfe-aside-sm {{{ */
.mgfe-aside.aside-right.aside-sm {
	width: 40px;
	transform: translateX(50px);
	top: calc(50% - 30px); /* Approx middle of the screen */
	bottom: inherit;
	border-radius: 5px;
}

.mgfe-aside.aside-right.aside-sm .form-group {
	margin: 0;
}

/* Remove BS padding from sub-elements */
.mgfe-aside.aside-right.aside-sm .form-group [class*="col-"] {
	padding: 0;
}
/* }}} */

/* Headers {{{ */
.mgfe-aside .aside-header {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	border-bottom: 1px solid #e9ecef;
	margin: 0;
}

.mgfe-aside .aside-header h4 {
	flex-grow: 1;
}

.mgfe-aside .aside-header legend.form-control-static {
	border-bottom: none;
	font-size: 17pt;
}

.mgfe-aside .aside-header .close {
	color: #5e5e5e;
}

.mgfe-aside .aside-header .close:hover {
	color: #000;
}

.mgfe-aside .aside-header .close::after {
	display: inline-block;
	font-family: 'Font Awesome 5 Pro';
	font-weight: 900;
	content: "\f00d";
}
/* }}} */

/* Actions {{{ */
.mgfe-aside .aside-actions {
	justify-self: flex-end;
	margin-right: 10px;
}

.mgfe-aside .aside-actions .btn-group {
	border: none;
	box-shadow: none;
}

.mgfe-aside .aside-actions a {
	padding: 8px;
	font-size: 125%;
}
/* }}} */

/* Body {{{ */
.mgfe-aside .aside-body {
	margin-left: 0;
	margin: 10px 0 0;

	/* Body scrolling */
	overflow: auto;
	height: calc(100vh - 80px);
}
/* }}} */
/* }}} */

/* Component highlighting {{{

/* Highlight applied to active elements inside an mgContainer */
.mg-form-editor-target {
	border: 2px solid var(--blue);
	border-radius: 5px;
	position: relative;
	top: -4px;
	left: -4px;
	padding: 2px;
}

.mg-form-editor-drop-target {
}

.mg-form-editor-drop-target-before {
	border-top: 4px dashed var(--blue);
}

.mg-form-editor-drop-target-after {
	border-bottom: 4px dashed var(--blue);
}
/* }}} */

/* Drag + Drop {{{ */
body.mg-form-editor-dragging * {
	cursor: grabbing;
}

#mg-form-editor-drag {
	display: block;
	z-index: 1000;
	position: absolute;
	top: -10000px;
	left: -10000px;
	min-width: 160px;
	height: 40px;
	border-radius: 5px;
	background: #2196F3;
	box-shadow: 1px 1px 4px rgba(0,0,0,.3);
	padding: 10px;
	color: #FFF;
}

#mg-form-editor-drag > i {
	margin-right: 5px;
}
/* }}} */

/* Misc fixes {{{ */
/* Buttons that are also fixed with look weird */
.mg-form-editor .btn.fa-fw {
	width: 2.30em;
	padding: 4px 2px !important;
}
/* }}} */
</style>
