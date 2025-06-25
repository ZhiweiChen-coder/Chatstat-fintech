<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgDate').enable(false);

import _ from 'lodash';
import moment from 'moment';

export default app.mgComponent('mgDate', {
	meta: {
		title: 'Date selection',
		icon: 'far fa-calendar',
		category: 'Simple Inputs',
		preferId: true,
		format: v => {
			if (!v) return '';
			return moment(v).format(moment.HTML5_FMT.DATE);
		},
		formatClass: 'text-center',
	},
	data() { return {
		formData: undefined,
	}},
	props: {
		title: {type: 'mgText'},
		min: {type: 'mgDate', title: 'Earliest date'},
		max: {type: 'mgDate', title: 'Latest date'},
		required: {type: 'mgToggle', default: false},
	},
	created() {
		this.$debug = $debug;

		this.$on('mgValidate', reply => {
			if (this.$props.required && !this.data) return reply(`${this.$props.title} is required`);
			if (_.isString(this.data)) {
				var d = moment(this.data);
				if (!d.isValid()) return reply(`${this.$props.title} must be a date`);
				if (this.$props.min && d.isBefore(this.$props.min)) return reply(`${$props.title} is too early (earliest date is ${this.$props.min})`);
				if (this.$props.max && d.isAfter($props.max)) return reply(`${$props.title} is too late (latest date is ${this.$props.max})`);
			}
		});

		this.$watch('data', ()=> {
			if (!this.data) return;
			this.formData = moment(this.data).format(moment.HTML5_FMT.DATE);
		}, { immediate: true });

		this.$watch('formData', ()=> {
			this.data = moment(this.formData, moment.HTML5_FMT.DATE).toISOString();
		});
	},
});
</script>

<template>
	<div class="mg-date">
		<!-- TODO: Allow for read-only displays -->
		<input
			v-model="formData"
			type="date"
			class="form-control"
			:max="$props.max"
			:min="$props.min"
		/>

		<div v-if="this.$debug.$enabled" class="card">
			<div class="card-header">
				Raw data
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</div>
</template>
