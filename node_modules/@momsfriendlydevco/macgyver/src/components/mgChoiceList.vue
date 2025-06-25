<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgChoiceList').enable(false);

import _ from 'lodash';
import ChoiceEnum from '../mixins/ChoiceEnum.js';

export default app.mgComponent('mgChoiceList', {
	mixins: [ChoiceEnum],
	meta: {
		title: 'Radio multiple-choice',
		icon: 'far fa-list-ol',
		category: 'Choice Selectors',
		preferId: true,
	},
	data() { return {
		enumIter: [],
	}},
	props: {
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		itemClassActive: {type: 'mgText', default: 'active', advanced: true},
		itemClassInactive: {type: 'mgText', default: '', advanced: true},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		select(option) {
			if (!option) return this.data = null;

			this.data = this.getOptionKey(option);
			if (option.action) this.$mgForm.run(option.action);
		},
	},
});
</script>

<template>
	<div class="mg-choice-list list-group">
		<a
			v-for="option in options"
			:key="getOptionKey(option)"
			class="list-group-item"
			:class="getOptionKey(option) && data == getOptionKey(option)
				? option.classActive || option.class || $props.itemClassActive
				: option.classInactive || option.class || $props.itemClassInactive
			"
			tabindex="0"
			v-tooltip="option.tooltip"
			@keyup.space="select(option)"
			@click="select(option)"
		>
			<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)" />
			{{ getOptionLabel(option) }}
		</a>
	</div>
</template>

<style>
.mg-choice-list .list-group-item.active {
	color: #fff;
}
</style>
