<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgChoiceRadio').enable(false);

import _ from 'lodash';
import ChoiceEnum from '../mixins/ChoiceEnum.js';

export default app.mgComponent('mgChoiceRadio', {
	mixins: [ChoiceEnum],
	meta: {
		title: 'Radio multiple-choice',
		icon: 'far fa-list-ul',
		category: 'Choice Selectors',
		preferId: true,
	},
	props: {
		id: {type: 'mgText'},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});
	},
	methods: {
		/*
		// TODO: Selection like others?
		select(option) {
			if (!option) return this.data = this.selected = null;

			this.data = this.getOptionKey(option);
			this.selected = option;
			if (option.action) this.$mgForm.run(option.action);
		},
		*/
	},
});
</script>

<template>
	<div class="mg-choice-radio">
		<div class="form-check" v-for="option in options" :key="getOptionKey(option)">
			<!-- TODO: _uid -->
			<input
				v-model="data"
				type="radio"
				:name="$props.id"
				:value="getOptionKey(option)"
				:id="`check-${$props.id}-${getOptionKey(option)}`"
			/>
			<label class="form-check-label" :for="`check-${$props.id}-${getOptionKey(option)}`">
				<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)" />
				{{ getOptionLabel(option) }}
			</label>
		</div>
	</div>
</template>
