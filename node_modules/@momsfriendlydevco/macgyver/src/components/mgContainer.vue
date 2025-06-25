<script lang="js">
/**
* MacGyver component loader
* This is a meta component that loads other dynamic components as an array
*/
export default app.mgComponent('mgContainer', {
	inject: {
		$mgForm: {from: '$mgForm'},
		$mgFormEditor: {from: '$mgFormEditor', default: false},
	},
	meta: {
		title: 'Container layout',
		icon: 'far fa-th-large',
		category: 'Layout',
		preferId: false,
	},
	props: {
		layout: {
			type: 'mgChoiceRadio',
			title: 'Layout profile',
			help: 'How to layout child elements',
			default: 'form',
			enum: [
				{id: 'form', title: 'Simple form layout'},
				{id: 'formFloating', title: 'Form with floating labels'},
				{id: 'card', title: 'Card based layout'},
				{id: 'columns', title: 'Vertical column layout'},
				{id: 'query', title: 'Query constructor'},
			],
		},
		formClass: {
			type: 'mgChoiceDropdown',
			title: 'Form style',
			showIf: {layout: {$in: ['form', 'card']}},
			default: 'normal',
			// FIXME: Should this be restricted to an enum?
			enum: [
				{id: 'normal', title: 'Normal'},
				{id: 'titles-above', title: 'Titles above'},
			],
		},
		title: {type: 'mgText', showIf: {layout: 'card'}},
		showTitles: {type: 'mgToggle', default: true, help: 'Show titles for fields', showIf: {layout: {$in: ['form', 'card']}}},
		columnHeaders: {type: 'mgToggle', default: false, help: 'Show column headers', showIf: "layout == 'columns'"},
		collapsable: {type: 'mgToggle', default: false, help: 'This card can be hidden', showIf: "layout == 'card'"},
		collapsed: {type: 'mgToggle', default: false, help: 'This card is collapsed by default', showIf: "layout == 'card'"},
		border: {type: 'mgToggle', default: true, help: 'Show a border around the container', showIf: "layout == 'columns'"},
		verbs: {
			type: 'mgTable',
			advanced: true,
			showIf: "layout == 'card'",
			items: [
				{id: 'icon', type: 'mgIcon'},
				{id: 'tooltip', type: 'mgText'},
				{id: 'class', type: 'mgText'},
				{id: 'action', type: 'mgText'},
			],
		},

		items: {type: 'mgAlert', vueType: 'array', text: 'Use the editor to define child widgets'}, // Child items
	},
	childProps: {
		help: {type: 'mgText', title: 'Help text', help: 'Optional help text for the item - just like what you are reading now'},
		showTitle: {type: 'mgToggle', default: true, title: 'Show Title', help: 'Whether to show the side title for this element'},
		title: {type: 'mgText', title: 'Title'},
		rowClass: {type: 'mgChoiceDropdown', title: 'Styling', help: 'Additional styling to apply to the widget', default: '', advanced: true, enum: [
			{id: '', title: 'Normal'},
			{id: 'mgContainerRowLarge', title: 'Large text'},
		]},
		onChange: {type: 'string', title: 'Change action', help: 'Action to trigger when the value of this component changes', advanced: true},
		show: {type: 'mgToggle', default: true, advanced: true, help: 'Whether the item is visible by default'},
		showIf: {type: 'mgCode', syntax: 'text', advanced: true, help: 'A simple equality expression or Sift object to deteremine visibility'},
	},
	data() { return {
		highlights: {}, // Lookup of extra classes to add to widgets, each key is the array offset of the widget within this container, the value is an array of classes to add
		localData: {}, // Lookup of immediate child data values, used when `$props.layout == 'formFloating'`
	}},
	mounted() {
		if (this.$props.collapsable) {
			var $card = $(this.$el).find('.card').first();

			$card.find('.card-header').first().on('click', ()=> {
				var $body = $(this.$el).find('.card-body');
				if ($card.hasClass('card-collapsed')) {
					$body.slideDown({complete: ()=> $card.removeClass('card-collapsed')});
				} else {
					$body.slideUp({complete: ()=> $card.addClass('card-collapsed')});
				}
			});
		}

		if (this.$props.layout == 'formFloating') {
			// When in floating mode we need to keep track of child data so we copy its value into our `localData` object lookup
			this.$mgForm.$on('changeItem', v => { // Bind to parent form handler
				if (this.$props.items.some(item => item.$dataPath == v.path)) { // Is this widget one of our immediate children?
					this.$set(this.localData, v.path, v.value); // Copy its data against our local copy
				}
			});
		}
	},
	methods: {
		/**
		* Emit an event passing this container as a scope
		* This is really just a wrapper to be able to pass this VueComponent to mgContainer.* emitters
		* @param {string} eventName Event to emit
		* @param {string} specPath The widget specPath
		* @param {number} widgetIndex The widget sending the message
		*/
		componentEvent(eventName, specPath, widgetIndex, vueEvent) {
			this.$mgForm.$emit(eventName, this, specPath, widgetIndex, vueEvent);
		},


		/**
		* Find the child index by its component
		* This works like findIndex only with Magyver components, ignoring all non-mg children when computing the index
		* @param {VueComponent} child The child offset to find
		* @returns {number} The offset of the component or boolean `false`
		*/
		findChildIndex(child) {
			var result = _(this.$refs)
				.map(v => v[0]) // Dynamic refs always end up as an array of 1 item, so unpack that
				.reduce((t, v, i) => {
					if (t.found) { // Already found the child
						return t;
					} else if (v._uid == child._uid) { // Found by direct UID
						return {...t, found: true};
					} else if (v.$children && v.$children.length == 1 && v.$children[0]._uid == child._uid) { // Check into mgComponent wrappers
						return {...t, found: true};
					} else if (v.$mgForm) { // Is an mgComponent {
						return {...t, mgIndex: t.mgIndex + 1};
					} else { // Implied else - regular Vue component - skip incrementing when calculating the offset
						return t;
					}
				}, {found: false, mgIndex: 0});

			return (result.found ? result.mgIndex : false);
		},
	},
});
</script>

<template>
	<!-- Layout: form {{{ -->
	<div
		v-if="$props.layout == 'form' || $props.layout === undefined"
		class="mg-container"
		:class="$props.formClass"
	>
		<div
			v-for="(widget, widgetIndex) in $props.items"
			:key="widget.id"
			v-if="widget.show"
			class="form-group row mg-component"
			:class="[widget.mgValidation == 'error' ? 'has-error' : '', widget.rowClass].concat(highlights[widgetIndex] || [])"
		>
			<label v-if="widget.showTitle || $props.showTitles" class="col-form-label text-left col-sm-3">
				{{widget.title}}
			</label>
			<div class="col-form-value mg-component-wrapper" :class="widget.showTitle || $props.showTitles ? 'col-sm-9' : 'col-sm-12'">
				<mg-component
					:ref="widgetIndex"
					:config="widget"
				/>
			</div>
			<div class="help-block" v-if="widget.help" :class="widget.showTitle || $props.showTitles ? 'col-sm-9 col-sm-offset-3' : 'col-sm-12'">{{widget.help}}</div>
		</div>
	</div>
	<!-- }}} -->
	<!-- Layout: card {{{ -->
	<div
		v-else-if="$props.layout == 'card'"
		class="mg-container"
		:class="$props.formClass"
	>
		<div class="card mg-container" :class="{'card-collapsable': $props.collapsable, 'card-collapsed': $props.collapsed}">
			<div v-if="$props.title || ($props.verbs && $props.verbs.length)" class="card-header">
				{{$props.title}}
				<div v-if="$props.verbs && $props.verbs.length" class="card-verbs">
					<a
						v-for="(verb, verbIndex) in $props.verbs"
						:key="verbIndex"
						:class="[verb.class, verb.icon]"
						v-tooltip="verb.tooltip"
						@click="$mgForm.run(form, verb.action)"
					/>
				</div>
			</div>
			<div class="card-body">
				<div
					v-for="(widget, widgetIndex) in $props.items"
					:key="widget.id"
					v-if="widget.show"
					class="form-group row mg-component"
					:class="[widget.mgValidation == 'error' ? 'has-error' : '', widget.rowClass].concat(highlights[widgetIndex] || [])"
					@click="componentEvent('mgContainer.click', widget.$specPath, widgetIndex, $event)"
					@mouseenter="componentEvent('mgContainer.mouseEnter', widget.$specPath, widgetIndex, $event)"
					@mouseleave="componentEvent('mgContainer.mouseLeave', widget.$specPath, widgetIndex, $event)"
				>
					<mg-form-editor-controls
						v-if="$mgFormEditor"
						v-show="highlights[widgetIndex] && highlights[widgetIndex].some(c => c == 'editHover' || c == 'editEditing')"
						:config="widget"
					/>
					<label v-if="widget.showTitle || $props.showTitles" class="col-form-label text-left col-sm-3">
						{{widget.title}}
					</label>
					<div class="col-form-value mg-component-wrapper" :class="widget.showTitle || $props.showTitles ? 'col-sm-9' : 'col-sm-12'">
						<mg-component
							:ref="widgetIndex"
							:config="widget"
						/>
					</div>
					<div class="help-block" v-if="widget.help" :class="widget.showTitle || $props.showTitles ? 'col-sm-9 col-sm-offset-3' : 'col-sm-12'">{{widget.help}}</div>
				</div>
			</div>
		</div>
	</div>
	<!-- }}} -->
	<!-- Layout: formFloating {{{ -->
	<div v-else-if="$props.layout == 'formFloating'">
		<div
			v-for="(widget, widgetIndex) in $props.items"
			:key="widget.id"
			v-if="widget.show"
			class="form-group mgContainer-formFloating row mg-component"
			:class="[widget.mgValidation == 'error' ? 'has-error' : '', widget.rowClass].concat(highlights[widgetIndex] || [])"
		>
			<div class="col-12 mg-component-wrapper">
				<mg-component
					:config="widget"
					class="control-input"
					:class="!localData[widget.$dataPath] && 'blank'"
				/>
				<label v-if="$props.showTitles" class="col-form-label text-left col-sm-3">
					{{widget.title}}
				</label>
			</div>
			<div class="help-block" v-if="widget.help" :class="widget.showTitle || $props.showTitles ? 'col-sm-9 col-sm-offset-3' : 'col-sm-12'">{{widget.help}}</div>
		</div>
	</div>
	<!-- }}} -->
	<!-- Layout: columns {{{ -->
	<div v-else-if="$props.layout == 'columns'">
		<table class="mg-container" :class="$props.border ? 'table table-bordered' : 'mg-container-columns-no-border'" style="width: 100%">
			<thead v-if="$props.columnHeaders">
				<tr>
					<th
						v-for="widget in config.items"
						:key="widget.id"
						v-if="widget.show"
					>{{widget.title}}</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td
						v-for="(widget, widgetIndex) in $props.items"
						:key="widget.id"
						v-if="widget.show"
						class="mg-component-wrapper"
						:class="[widget.mgValidation == 'error' ? 'has-error' : '', widget.rowClass].concat(highlights[widgetIndex] || [])"
					>
						<mg-component
							:ref="widgetIndex"
							:config="widget"
						/>
						<div class="help-block" v-if="widget.help">{{widget.help}}</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<!-- }}} -->
	<!-- Layout: query {{{ -->
	<div v-else-if="$props.layout == 'query'">
		<div class="mg-container mg-container-query">
			<div v-for="rowWidget in $props.items" :key="rowWidget.id">
				<div v-if="rowWidget.type == 'mgContainer' && rowWidget.layout == 'query-row'" class="row">
					<div v-for="colWidget in rowWidget.items" :key="colWidget.id" class="col mg-component mg-component-wrapper">
						<mg-component
							:ref="widgetIndex"
							:config="colWidget"
						/>
					</div>
				</div>
				<div v-else class="alert alert-danger">
					All children of mgContainer[layout=query] must match the mgContainer[layout=queryRow]
					<pre>{{widget}}</pre>
				</div>
			</div>
		</div>
	</div>
	<!-- }}} -->
	<!-- Layout: unknown {{{ -->
	<div v-else class="mg-container">
		<div class="alert alert-danger">
			Unsupported mgContainer layout "{{$props.layout || 'Unspecified'}}"
			<pre>{{$props}}</pre>
		</div>
	</div>
	<!-- }}} -->
</template>

<style>
/* formClass > .titles-above {{{ */
.mg-container.titles-above > .form-group,
.mg-container.titles-above > .form-group,
.mg-container.titles-above > .card > .card-body > .form-group,
.mg-container.titles-above > .card > .card-body > .form-group {
	display: block;
}

.mg-container.titles-above > .form-group > .col-form-label,
.mg-container.titles-above > .form-group > .col-form-value,
.mg-container.titles-above > .card > .card-body > .form-group > .col-form-label,
.mg-container.titles-above > .card > .card-body > .form-group > .col-form-value {
	width: 100%;
	max-width: none;
}
/* }}} */

/* Card layout {{{ */
/* Collapsable card {{{ */
.mg-container.card.card-collapsable {
	transition: all 0.2s ease-in;
}

.mg-container.card.card-collapsable .card-header {
	cursor: pointer;
}

.mg-container.card.card-collapsable .card-header::after {
	font-family: "Font Awesome 5 Pro";
	content: '\f054';
	float: right;
	transition: transform 0.4s;
}

.mg-container.card.card-collapsable:not(.card-collapsed) .card-header::after {
	transform: rotate(90deg);
}


/* Collapsed card {{{ */
.mg-container.card.card-collapsable.card-collapsed {
	box-shadow: none;
	border-bottom: none;
	margin-bottom: 0px;
}

.mg-container.card.card-collapsable.card-collapsed .card-body {
	display: none;
}
/* }}} */
/* }}} */

/* Card verbs {{{ */
.mg-container.card .card-header .card-verbs {
	position: absolute;
	right: 15px;
	top: 10px;
	font-size: 20px;
}

.mg-container.card .card-header .card-verbs > a {
	color: #999;
	padding: 5px;
}

.mg-container.card .card-header .card-verbs > a:hover {
	color: #000;
}
/* }}} */
/* }}} */

/* formFloating {{{ */
.mgContainer-formFloating > .col-12 {
	position: relative;
	line-height: 14px;
	margin: 0 0px;
	display: inline-block;
	width: 100%;
}

.mgContainer-formFloating > .col-12 > .control-input {
	height: 45px;
	padding-top: 8px;
	padding-bottom: 2px;
	padding-left: 2px;
	padding-right: 12px;
	font-size: 15px;
	line-height: 1.42857143;
	color: #333333;
	background-color: #ffffff;
	background-image: none;
	outline: none;
	/* border: 1px solid rgba(120, 120, 120, 0.5);
	*/
	border: none;
	border-bottom: 1px solid #bbb;
	-moz-box-shadow: none;
	-webkit-box-shadow: none;
	box-shadow: none;
	border-radius: 0;
	position: relative;
}

.mgContainer-formFloating > .col-12 > .control-input.blank + .col-form-label {
	transform: translateY(0px);
	color: #bbb;
	font-size: 15px;
	font-weight: 100;
	opacity: 1;
}

.mgContainer-formFloating > .col-12 > .control-input.control-input:focus + .col-form-label {
	transform: translateY(-21px);
	color: #66afe9;
	font-size: 14px;
	opacity: 1;
	font-weight: 100;
	background-color: white;
}

.mgContainer-formFloating > .col-12 > .col-form-label {
	color: #aaa;
	display: inline-block;
	font-size: 12px;
	position: absolute;
	z-index: 2;
	left: 2px;
	top: 16px;
	padding: 0 0px;
	pointer-events: none;
	background: white;
	transition: all 300ms ease;
	transform: translateY(-21px);
	font-weight: 500;
}
/* }}} */

/* Columns layout {{{ */
.mg-container.mg-container-columns-no-border th,
.mg-container.mg-container-columns-no-border td {
	padding: 5px;
}
/* }}} */

/* Query layout {{{ */
.mg-container.mg-container-query .row {
	display: block;
}

.mg-container.mg-container-query .col {
	display: inline-flex;
	width: 200px;
	height: 35px;
	min-width: 200px;
	margin-left: 30px;
	margin-bottom: 10px;
	max-width: 400px;
	position: relative;
	align-items: center;
	box-shadow: 1px 3px 5px 0px rgba(50, 50, 50, 0.75);
	border-radius: 3px;
	color: #FFF;
	height: 38px;
	padding: 5px 15px;
	background: #FFF;
}

/* Query > Background color scale {{{ */
.mg-container.mg-container-query .col:nth-child(1) {
	background: #104E8B;
}

.mg-container.mg-container-query .col:nth-child(2) {
	background: #1874CD;
}

.mg-container.mg-container-query .col:nth-child(3) {
	background: #1C86EE;
}
/* }}} */

/* Query > Connecting lines {{{ */
/* Vertical */
.mg-container.mg-container-query .row::before {
	background-color: #CCC;
	content: '';
	display: block;
	position: absolute;
	width: 4px;
	top: 17px;
	bottom: 30px;
}

/* Horizontal */
.mg-container.mg-container-query .col::before {
	left: -30px;
	height: 4px;
	top: calc(50% - 2px);
	width: 30px;
	background-color: #CCC;
	content: '';
	display: block;
	position: absolute;
}
/* }}} */

/* Query > Basic Inputs {{{ */
.mg-container.mg-container-query .col input {
	background: transparent;
	border: 1px solid transparent;
	color: #FFF;
	height: 1.8em;
	border-radius: 0px;
}

.mg-container.mg-container-query .col input[type=text] {
	border-bottom: 1px solid #CCC;
}

.mg-container.mg-container-query .col input[type=number] {
	text-align: center;
}

.mg-container.mg-container-query .col input:focus {
	box-shadow: none;
	border: 1px solid #CCC;
}
/* }}} */

/* Query > Buttons {{{ */
.mg-container.mg-container-query .col .btn {
	box-shadow: none;
	padding: 1px 5px;
	background: transparent;
	border: 1px solid #003e7b;
}

.mg-container.mg-container-query .col .btn,
.mg-container.mg-container-query .col svg {
	opacity: 0.2;
	transition: opacity 0.5s;
}

.mg-container.mg-container-query .row:hover .col .btn,
.mg-container.mg-container-query .row:hover .col svg {
	opacity: 1;
}

.mg-container.mg-container-query .col .vs__clear {
	display: none;
}
/* }}} */

/* Query > Dropdowns {{{ */
.mg-container.mg-container-query .v-select {
	width: 100%;
}

.mg-container.mg-container-query .v-select,
.mg-container.mg-container-query .v-select .vs--searchable .vs__dropdown-toggle,
.mg-container.mg-container-query .v-select .vs__selected,
.mg-container.mg-container-query .v-select input,
.mg-container.mg-container-query .v-select .vs__actions {
	cursor: pointer !important;
}

.mg-container.mg-container-query .v-select .vs__dropdown-toggle {
	border: none;
}

.mg-container.mg-container-query .col .v-select .vs__selected {
	color: #FFF;
}

.mg-container.mg-container-query .col .v-select .vs__selected {
	top: 3px;
}

.mg-container.mg-container-query .col .v-select .vs__actions svg,
.mg-container.mg-container-query .col .v-select .vs__deselect {
	stroke: #FFF;
	fill: #FFF;
}

.mg-container.mg-container-query .col .v-select.mg-choice-tags .vs__selected-options .vs__selected {
	background-color: #5bc0de;
	border-radius: 10px;
	color: #fff;
	display: inline-block;
	font-size: 12px;
	line-height: 1rem;
	min-width: 10px;
	padding: 1px 10px;
	text-align: center;
	vertical-align: middle;
	white-space: nowrap;
	border: none;
}
/* }}} */

/* Query > Toggle {{{ */
.mg-container.mg-container-query .col .vue-js-switch {
	margin: auto;
	height: 10px;
	top: -5px;
}
/* }}} */
/* }}} */

/* Misc utility types {{{ */
.mg-form .help-block {
	font-size: 80%;
	color: #6c757d !important;
}
/* }}} */
</style>
