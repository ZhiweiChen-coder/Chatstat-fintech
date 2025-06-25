<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgChoiceCheckbox').enable(false);

import _ from 'lodash';
import ChoiceEnum from '../mixins/ChoiceEnum.js';

export default app.mgComponent('mgChoiceCheckbox', {
	mixins: [ChoiceEnum],
	meta: {
		title: 'Checkbox multiple-choice',
		icon: 'far fa-list',
		category: 'Choice Selectors',
		preferId: true,
		// TODO: format function to output choices as CSV?
	},
	props: {
		title: {type: 'mgText'},
		id: {type: 'mgText'},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		sort: {
			type: 'mgChoiceRadio',
			default: 'addOrder',
			advanced: true,
			help: 'Sort newly ticked items into their correct position',
			enum: [
				{id: 'addOrder', title: 'No sorting'},
				{id: 'sortId', title: 'Sort by item ID'},
				{id: 'sortTitle', title: 'Sort by title'},
			],
		},
	},
	methods: {
		select(option) {
			if (!option) return this.data = null;

			if (!this.data) this.data = [];

			if (this.data.some(i => i == option)) { // Checked
				this.data = this.data.filter(i => i != this.getOptionKey(option));
			} else {
				this.data.push(this.getOptionKey(option));

				if (this.$props.sort == 'sortId') {
					this.data.sort();
				} else if (this.$props.sort == 'sortTitle') {
					this.data = _.sortBy(this.data, d => this.enum.find(item => this.getOptionKey(item) == d));
				}
			}
			if (option.action) this.$mgForm.run(option.action);
		},
	},
	created() {
		this.$debug = $debug;

		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
		});

		if (!_.isArray(this.data)) this.data = [];
	},
});
</script>

<template>
	<div class="mg-choice-checkbox">
		<div class="form-check" v-for="option in options" :key="getOptionKey(option)">
			<!-- TODO: Replace id strings with _uid -->
			<input
				type="checkbox"
				:id="`mg-choice-checkbox-${$props.id}-${getOptionKey(option)}`"
				:checked="data.includes(getOptionKey(option))"
				@change="select(option)"
			/>
			<label class="form-check-label" :for="`mg-choice-checkbox-${$props.id}-${getOptionKey(option)}`">
				<i v-if="getOptionIcon(option)" :class="getOptionIcon(option)"/>
				{{ getOptionLabel(option) }}
			</label>
		</div>
	</div>
</template>
