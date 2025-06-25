MacGyver
========
Dynamic form widgets for Vue.

MacGyver is a component library and dynamic form designer for Vue.

It can function either as a simple set of powerful independent components or by using a powerful JSON form layout definition.

[LIVE DEMO](https://momsfriendlydevco.github.io/MacGyver2)


Prerequisites
-------------
This package requires the following as pre-requisite dependencies in the parent:

* [@momsfriendlydevco/vue-setpath](https://github.com/MomsFriendlyDevCo/vue-setpath)
* [@doop/watch-all](https://github.com/MomsFriendlyDevCo/doop-watch-all)
* [@doop/emit](https://github.com/MomsFriendlyDevCo/doop-emit)

These are listed as `peerDependencies` in package.json.


Example
-------
```html
<mg-form
	:data="{}" // Populated as the control values change
	:config="{ // Our form specification
		type: "mgContainer",
		items: [
			{
				id: "textInput",
				type: "mgText",
				title: "Example Text",
			},
			{
				id: "toggleControl",
				type: "mgToggle",
				default: true,
			},
		],
	}"
	@change="data = $event"
/>
```

or use MacGyver widgets as standalone Vue components:


```html
<mg-number
	:value="formData.number"
	@change="formData.number = $event"
	:min="0"
	:max="100"
/>
```


Creating MacGyver widgets
=========================
Each MagGyver widget begins with `mg` and should be registered via `Vue.mgComponent(name, definitionObject)`.

```javascript
Vue.mgComponent('mgText', {
	meta: {
		title: 'Textbox',
		icon: 'fa fa-pencil-square-o',
	},
	props: {
		placeholder: {type: 'mgText', help: 'Ghost text to display when the textbox has no value'},
	},
}));
```

The `Vue.mgComponent()` function processes the MacGyver widget definition and automatically calls `Vue.component()` to register the Vue counterpart (after converting prop types and adding other syntax glue to the original object).


Widget setup
------------
MacGyver widgets follow the regular [Vue component syntax](https://vuejs.org/v2/guide/components.html) with some additions:

| Property           | Type                   | Default                     | Description                                                                                |
|--------------------|------------------------|-----------------------------|--------------------------------------------------------------------------------------------|
| `meta`             | `object`               | `{}`                        | Meta information object - used by the form editor to configure the widget                  |
| `meta.id`          | `string`               | Computed from name          | The name of the macgyver component. Always camelcased and prefixed with `mg` e.g. `mgText` |
| `meta.title`       | `string`               | The ID via `_.startCase()`  | The human friendly title of the widget                                                     |
| `meta.icon`        | `string`               | `"far fa-rectangle-wide"`   | The icon CSS class to use in the `mgFormEditor` UI                                         |
| `meta.shorthand`   | `array`                | `[]`                        | Other aliases the widget answers to in shorthand mode                                      |
| `meta.category`    | `string`               | `"Misc"`                    | Human readable category to add the widget to in the editor                                 |
| `meta.preferId`    | `boolean`              | `false`                     | Whether the component should be auto-allocated an ID if the user doesn't provide one       |
| `meta.format`      | `boolean` / `function` | `true`                      | How to return the short value of the widget, see NOTES                                     |
| `meta.formatClass` | `string`               | `""`                        | CSS classes to attach when rendering the `format` value, typically used for text alignment |
| `props`            | `object`               | `{}`                        | Vue [props](https://vuejs.org/v2/guide/components-props.html) definition                   |
| `props.$type`      | `string`               | Name                        | The MacGyver type (e.g. `mgText`)                                                          |
| `props.$dataPath`  | `string`               | Computed                    | Dotted notation path within the form of the value to set when `this.data` changes          |
| `props.$specPath`  | `string`               | Computed                    | Dotted notation path of the widget spec within the parent `$mgForm` layout                 |
| `props.change`     | `function`             | *none*                      | Function to execute when the value changes                                                 |
| `props{}.value`    | `*`                    | *none*                      | If using the widget as a standalone, set the initial value                                 |
| `props{}.title`    | `string`               | Prop ID via `_.startCase()` | Human readable name for the property in the editor                                         |
| `props{}.default`  | `*`                    | `undefined`                 | Regular property default value                                                             |
| `props{}.type`     | `string`               | *none*                      | Unlike Vue props, this should be an `mg*` widget with its config                           |
| `props{}.vueType`  | `string` / `array`     | Computed                    | Type validator to pass to view, this should be an array or string, not native types        |
| `props{}.help`     | `string`               | `""`                        | Additional help text in the editor                                                         |
| `props{}.advanced` | `boolean`              | `false`                     | Label the property for advanced users only                                                 |
| `props{}.*`        | `*`                    | *none*                      | All other MacGyver widget config for the `props{}.type` widget                             |
| `childProps`       | `object`               | *none*                      | All properties that are inherited by direct child components within a container            |
| `inject`           | `array` / `object`     | `['$mgForm']`               | What to inject into each MacGyver component, overridable if needed                         |
| `data`             | `function`             | *none*                      | Data to provide to the component, `this.data` is always available                          |
| `methods`          | `object`               | `{}`                        | Additional methods to provide, the below methods are always available                      |
| `methods.mgSetup`  | `function`             | See code                    | Called during the `created` lifecycle hook to populate the data default and setup bindings |
| `created`          | `function`             | *none*                      | Creation hook, superclassed to call `mgSetup()`. If Specified it is called after this      |
| `*`                | `*`                    | *none*                      | Various other Vue lifecycle hooks and properties, all are carried into the Vue component   |


**NOTES**:
* `meta.format` returns the human readable value of the component when rendered in tables - if `true` the value is used unchanged. If a function it is called as `(value, config)` and can return a scalar string or a Promisable value which should resolve into a string.
* `props{}.type` should always be a MacGyver component + config so it can be correctly displayed in the editor. Passing JS primative classes (e.g. `{foo: Number}`) will raise a warning message and is discouraged for anything other than testing
* `props{}.advanced` can be used to hide more complex properties unless the editor is in advanced editing mode
* `props{}.vueType` can override the "guessed" type to pass to Vue as a prop validator. Pass strings or arrays of strings not native types - for example `{vueType: 'string'}` or `{vueType: ['array', 'number']}` are both correct, `{vueType: String}` is not supported
* `data()` is called as per the usual Vue setup process, however the `data` value is always provided and is watched by MacGyver for changes. Mutate this value to set new values or emit `mgChange` if needed
* `childProps` sets up the properties inherited into the `$props` setup by direct children. Items such as `title` are used by elements such as `mgContainer` to render the title of the widget and not the widget itself


Injectables
-----------
The following injectables can be subscribed to within each component:

| Injectable      | Description                                                                                  |
|-----------------|----------------------------------------------------------------------------------------------|
| `$mgForm`       | The optional parent `mgForm` component, automatically applied if `vm.inject` isn't overriden |
| `$mgFormEditor` | The optional wrapping `mgFormEditor` component, if present. This is outside the `mgForm` parent, its presense can be used to determine whether to display special edit component features |

To specify optional injectables (e.g. that `$mgFormEditor` _may_ be included but is not essencial) use:

```javascript
{
	inject: {
		$mgForm: {from: '$mgForm', default: false},
		$mgFormEditor: {from: '$mgFormEditor', default: false},
	},
}
```


**NOTES:**

* `$mgForm` is only injected if the component is used inside a `<mg-form/>` component, otherwise its falsy. This usually occurs when the component is used as a standalone e.g. `<mg-button/>`
* `$mgFormEditor` is only injected if the form is wrapped within a editor context, check for its truthy status to determine if the widget should apply editable behaviours


Events
------

| Event           | Cardinality   | Params                 | Description                                                                                                  |
|-----------------|---------------|------------------------|--------------------------------------------------------------------------------------------------------------|
| `change`        | Optional      | `(*)`                  | Emitted when the widget is a standalone component and its value has changed                                  |
| `mgChange`      | Always        | `({path, value})`      | Used to respond to changes in the component state                                                            |
| `mgIdentify`    | Always        | `(reply <function>)`   | Used to retrieve all components, component will reply with its `VueComponent` instance                       |
| `mgRefresh`     | Always        | `()`                   | Used to force refresh the state of a component                                                               |
| `mgRefreshForm` | Always        | `()`                   | Used to force refresh the state of all components in a form                                                  |
| `mgValidate`    | Optional      | `(reply <function>)`   | Used to validate each component, each component should call `reply()` with string errors if validation fails |

**NOTES**:
* All of the above events are automatically added by the `mgSetup()` method when the component is created


Component Skeleton
------------------
In essence the following base skeleton is used for any component that is instantiated via `Vue.mgComponent(name, spec)`.
This contains all the injectables, default data props, default events and other hooks.
This structure can be considered a `Vue.mixin()` / `_.merge()` equivalent where all items are deep merged.

```javascript
Vue.mgComponent('mgAcmeComponent', {
	meta: {
		title: 'mgAcmeComponent',                            // Calculated via _.startCase() from the name
		icon: 'far fa-rectangle-wide',
		category: 'Misc',
		preferId: false,
		shorthand: [],
		format: true,
		formatClass: '',
	},
	inject: {
		$mgForm: {from: '$mgForm', default: false},          // Will be falsy if the component is stand-alone
	},
	props: {
		$dataPath: {type: String},                           // Default is set when component is populated (when inside an mg-form)
		$specPath: {type: String},                           // Default is set when component is popualted (when inside an mg-form)
		value: {},                                           // Default is populated when a stand-alone component
	},
	methods: {
		mgSetup() {                                          // Function which sets up event handlers and data watcher
			// ... //
		},
	},
	created() {
		this.mgSetup();                                      // Called on every create
		// ... //                                            // component created() lifecycle hook is called here
	},
	// ... //                                                    // Remaining component properties, methods and lifecycle hooks
});
```


API
===


$macgyver.compileSpec(spec)
--------------------------
Attempt to compile up a 'rough' MacGyver spec into a pristine one.
This function performs various sanity checks on nested elements e.g. checking each item has a valid ID and if not adding one.
It returns an object composed of the form `{spec}`


$macgyver.widgets
-----------------
An object containing data on each valid MacGyver widget registered. If running on the front-end this is updated as new widgets register themselves. On the backend this uses the computed version located in `./dist/widgets.json`.
