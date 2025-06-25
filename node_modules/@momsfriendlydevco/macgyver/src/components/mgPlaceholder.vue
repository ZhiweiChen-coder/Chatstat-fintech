<script lang="js">
export default app.mgComponent('mgPlaceholder', {
	meta: {
		title: 'Placeholder',
		icon: 'far fa-construction',
		category: 'General Decoration',
	},
	props: {
		text: {type: 'mgText'},
		height: {type: 'mgNumber', default: '100%'},
		style: {
			type: 'mgChoiceButtons',
			default: 'mg-placeholder-box',
			iconSelected: 'far fa-fw fa-check',
			iconDefault: 'far fa-fw',
			enum: [
				{id: 'mg-placeholder-box', title: 'Lined box'},
				{id: 'mg-placeholder-construction', title: 'Construction area'},
			],
		},
	},
});
</script>

<template>
	<div class="mg-placeholder" :class="$props.style" :style="`height: ${$props.height || 'auto'}`">
		<div v-if="$props.text" class="mg-placeholder-text">
			{{$props.text}}
		</div>
	</div>
</template>

<style>
.mg-placeholder {
	min-height: 100px;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 5px;
}

/* Style: placeholder-box {{{ */
.mg-placeholder.mg-placeholder-box {
	border: 1px solid #000;
	background:
		linear-gradient(to top left,
			rgba(0,0,0,0) 0%,
			rgba(0,0,0,0) calc(50% - 0.8px),
			rgba(0,0,0,1) 50%,
			rgba(0,0,0,0) calc(50% + 0.8px),
			rgba(0,0,0,0) 100%),
		linear-gradient(to top right,
			rgba(0,0,0,0) 0%,
			rgba(0,0,0,0) calc(50% - 0.8px),
			rgba(0,0,0,1) 50%,
			rgba(0,0,0,0) calc(50% + 0.8px),
			rgba(0,0,0,0) 100%);
}

.mg-placeholder.mg-placeholder-box > .mg-placeholder-text {
	background: #FFF;
	border-radius: 10px;
	padding: 10px 15px;
}
/* }}} */

/* Style: placeholder-construction {{{ */
.mg-placeholder.mg-placeholder-construction {
	background: repeating-linear-gradient(45deg, #dfc458, #dfc458 10px, #666 10px, #666 20px);
}

.mg-placeholder.mg-placeholder-construction > .mg-placeholder-text {
	font-size: 20pt;
	color: #FFF;
	text-shadow: -2px -2px 1px #000, 2px -2px 1px #000, -2px 2px 1px #000, 2px 2px 1px #000;
}
/* }}} */
</style>
