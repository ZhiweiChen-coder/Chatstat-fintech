<script lang="js">
export default app.component('mgFormEditorControls', {
	inject: ['$mgFormEditor'],
	props: {
		config: {type: Object, required: true},
	},
});
</script>

<template>
	<div class="mg-form-editor-controls">
		<div class="mg-form-editor-controls-title">
			{{$props.config.type}}
			<span v-if="$props.config.id" class="mg-form-editor-controls-id">
				#{{$props.config.id}}
			</span>
		</div>
		<div class="mg-form-editor-controls-buttons">
			<!-- NOTE: Add .stop to ignore next mouse click which would select the element under the cursor -->
			<a @click.stop="$mgFormEditor.addTarget = $props.config.$specPath; $mgFormEditor.addOrientation = 'after'; $mgFormEditor.setMode('adding', false)" class="far fa-plus" v-tooltip="'Insert widget after here'"/>
			<a @click="$mgFormEditor.duplicateWidget($props.config.$specPath)" class="far fa-clone" v-tooltip="'Duplicate widget'"/>
			<!-- FIXME: Not yet working <a @click="$mgFormEditor.dragWidget($props.config.$specPath)" class="far fa-arrows-alt" v-tooltip="'Move widget'"/> -->
			<a @click="$mgFormEditor.moveWidget($props.config.$specPath, 'up')" class="far fa-arrow-up" v-tooltip="'Move widget up'"/>
			<a @click="$mgFormEditor.moveWidget($props.config.$specPath, 'down')" class="far fa-arrow-down" v-tooltip="'Move widget down'"/>
			<a @click.stop="$mgFormEditor.removeWidget($props.config.$specPath)" class="fas fa-trash danger" v-tooltip="'Delete widget'"/>
		</div>
	</div>
</template>

<style>
/* Component outlines {{{ */
/* Neutral / Deselected {{{ */
.mg-form-editor .mg-component {
	border: 2px solid transparent;
	border-radius: 5px;
}
/* }}} */
/* Hover {{{ */
.mg-form-editor .mg-component.editHover {
	border: 2px dashed var(--mg-form-editor-hover-bg);
}
/* }}} */
/* Editing {{{ */
.mg-form-editor .mg-component.editEditing {
	border: 2px solid var(--mg-form-editor-selected-bg);
}
/* }}} */
/* }}} */

/* Edit controls {{{ */
.mg-form-editor-controls {
	position: absolute;
	transform: translate(2px, -30px);
	width: calc(100% - 20px);
}

/* Title {{{ */
.mg-form-editor-controls .mg-form-editor-controls-title,
.mg-form-editor-controls .mg-form-editor-controls-buttons {
	border-top-left-radius: 5px;
	border-top-right-radius: 5px;
	padding: 2px 8px;
}

.mg-form-editor-controls .mg-form-editor-controls-title {
	display: inline-block;
}

.mg-component.editHover .mg-form-editor-controls-title {
	background: var(--mg-form-editor-hover-bg);
	color: var(--mg-form-editor-hover-fg);
}

.mg-component.editEditing .mg-form-editor-controls-title {
	background: var(--mg-form-editor-selected-bg);
	color: var(--mg-form-editor-selected-fg);
}

.mg-component .mg-form-editor-controls-title .mg-form-editor-controls-id {
	font-weight: bold;
}
/* }}} */

/* Buttons {{{ */
.mg-form-editor-controls .mg-form-editor-controls-buttons {
	display: none;
	float: right;
	background: var(--mg-form-editor-selected-bg);
	color: var(--mg-form-editor-selected-fg);
}

.mg-component.editEditing .mg-form-editor-controls .mg-form-editor-controls-buttons {
	display: inline-block;
}

.mg-component.editEditing .mg-form-editor-controls .mg-form-editor-controls-buttons > a {
	border-radius: 50%;
	padding: 4px 5px;
}

.mg-component.editEditing .mg-form-editor-controls .mg-form-editor-controls-buttons > a:hover {
	background: var(--mg-form-editor-selected-highlight);
}

.mg-component.editEditing .mg-form-editor-controls .mg-form-editor-controls-buttons > a.danger:hover {
	background: var(--mg-form-editor-selected-danger);
}
/* }}} */
/* }}} */
</style>
