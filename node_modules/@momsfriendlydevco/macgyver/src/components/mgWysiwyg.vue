<script lang="js">
import {VueEditor} from 'vue2-editor';

export default app.mgComponent('mgWysiwyg', {
	meta: {
		title: 'WYSIWYG editor',
		icon: 'far fa-atlas',
		category: 'Complex Inputs',
		preferId: true,
		shorthand: ['content'],
	},
	components: {VueEditor},
	props: {
		title: {type: 'mgText'},
		placeholder: {type: 'mgText', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
});
</script>

<template>
	<vue-editor
		v-model="data"
		:placeholder="$props.placeholder"
		class="mg-wysiwyg"
	/>
</template>
