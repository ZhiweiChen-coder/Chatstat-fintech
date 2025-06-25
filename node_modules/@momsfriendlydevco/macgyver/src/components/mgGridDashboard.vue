<script lang="js">
import VueGridLayout from 'vue-grid-layout';
//import 'vue-grid-layout/dist/vue-grid-layout.umd.js';

app.component(VueGridLayout);

export default app.mgComponent('mgGridDashboard', {
	meta: {
		title: 'Grid layout',
		icon: 'far fa-chess-board',
		category: 'Layout',
	},
	data() { return {
		gridLayout: [],
	}},
	props: {
		columns: {type: 'mgNumber', default: 12, advanced: true},
		items: {type: 'mgUnknown', default: []}, // Each item also needs X, Y, W, H (W/H are block sizes not absolutes)
		rowHeight: {type: 'mgNumber', default: 30, advanced: true},
		marginHorizontal: {type: 'mgNumber', default: 10, advanced: true},
		marginVertical: {type: 'mgNumber', default: 10, advanced: true},
		defaultWidth: {type: 'mgNumber', default: 4, advanced: true},
		defaultHeight: {type: 'mgNumber', default: 4, advanced: true},
	},
	watch: {
		'$props.items': {
			immediate: true,
			handler() {
				// NOTE: This will TRY to allocate widgets in a logical left -> right order using the defaultWidth + defaultHeight allocations
				//       Since I'm not Einstein and this is an NP incomplete problem it will do so ignoring any existing blocks
				//       Obviously this is only intended for the intial setup, with the user configuring the blocks after that
				//       - MC 2019-01-02
				this.$set(this, 'gridLayout', this.$props.items.map((item, index) => ({
					i: index,
					x: Math.floor((index * this.$props.defaultWidth) % this.$props.columns), // Overflow when we hit the end of a column
					y: Math.floor((index * this.$props.defaultWidth) / this.$props.columns),
					w: this.$props.defaultWidth,
					h: this.$props.defaultHeight,
					...item,
				})));
			},
		},
	},
});
</script>

<template>
	<grid-layout
		class="mg-grid-dashboard"
		:layout="gridLayout"
		:col-num="$props.columns"
		:row-height="$props.rowHeight"
		:is-draggable="$macgyver.$forms[$props.form].editing"
		:is-resizable="$macgyver.$forms[$props.form].editing"
		:vertical-compact="true"
		:margin="[$props.marginHorizontal, $props.marginVertical]"
		:use-css-transforms="true"
	>
		<grid-item
			v-for="item in gridLayout" :key="item.i"
			:x="item.x"
			:y="item.y"
			:w="item.w"
			:h="item.h"
			:i="item.i"
		>
			<mg-component
				:form="$props.form"
				:config="item"
			/>
		</grid-item>
	</grid-layout>
</template>

<style>
.mg-grid-dashboard .vue-grid-item {
	border: 1px solid #f0f0f0;
	border-radius: 5px;
	background: #FFF;
}

.mg-grid-dashboard .vue-grid-item.vue-draggable-dragging {
box-shadow: 0px 1px 5px #000;
}

.mg-grid-dashboard .vue-grid-item.vue-grid-placeholder {
	background: var(--blue);
}

.mg-grid-dashboard .vue-grid-item > .vue-resizable-handle {
	display: none;
}

.mg-grid-dashboard .vue-grid-item:hover > .vue-resizable-handle {
	display: block;
	padding: 0;
	background: none;
	border-bottom: 10px solid var(--gray);
	border-right: 10px solid var(--gray);
	border-left: 10px solid transparent;
	border-top: 10px solid transparent;
}

.mg-grid-dashboard .vue-grid-item > .vue-resizable-handle:hover {
	border-bottom-color: var(--blue);
	border-right-color: var(--blue);
}
</style>
