<script lang="js">
/**
* Instance of a MacGyver widget
* This is the parent of all other mg* components
*
* @param {Object} config The MacGyver component config - this is a simple object containing all prototype $props mappings
*/
export default app.component('mgComponent', {
	inject: ['$mgForm'],
	data() { return {
		data: undefined,
	}},
	props: {
		config: {type: Object, required: true},
	},
	// TODO: Functional? Proxy? "Functional do not have state", "$data" and "$props" would need to be passed directly through to the render handler
	//functional: true,
	render(h) {
		if (!this.$macgyver.widgets[this.$props.config.type]) return h('mg-error', {props: {text: `Unknown widget type "${this.$props.config.type}"`}});

		return h(this.$props.config.type, {
			props: this.$props.config,
			nativeOn: {
				click: e => this.$mgForm.$emit('mgComponent.click', this, e),
				mousedown: e => this.$mgForm.$emit('mgComponent.mouseDown', this, e),
				mouseup: e => this.$mgForm.$emit('mgComponent.mouseUp', this, e),
				mousemove: e => this.$mgForm.$emit('mgComponent.mouseMove', this, e),
				mouseenter: e => this.$mgForm.$emit('mgComponent.mouseEnter', this, e),
				mouseleave: e => this.$mgForm.$emit('mgComponent.mouseLeave', this, e),
				mouseover: e => this.$mgForm.$emit('mgComponent.mouseOver', this, e),
				mouseout: e => this.$mgForm.$emit('mgComponent.mouseOut', this, e),
			},
		});
	},
});
</script>
