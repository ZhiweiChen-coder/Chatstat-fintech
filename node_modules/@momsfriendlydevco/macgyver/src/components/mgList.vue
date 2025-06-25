<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgList').enable(false);

import _ from 'lodash';

export default app.mgComponent('mgList', {
	meta: {
		title: 'List',
		icon: 'far fa-list-ul',
		category: 'Simple Inputs',
		preferId: true,
		format: v => (v || []).join(', '),
	},
	data() { return {
		newItem: '',
	}},
	props: {
		title: {type: 'mgText'},
		allowDelete: {type: 'mgToggle', default: true},
		min: {type: 'mgNumber', title: 'Minimum number of items'},
		max: {type: 'mgNumber', title: 'Maximum number of items'},
		required: {type: 'mgToggle', default: false},
		numbered: {type: 'mgToggle', default: true},
		addButtonActiveClass: {type: 'mgText', default: 'btn btn-block btn-success fa fa-plus', advanced: true},
		addButtonInactiveClass: {type: 'mgText', default: 'btn btn-block btn-disabled fa fa-plus', advanced: true},
	},
	created() {
		this.$on('mgValidate', reply => {
			if (this.$props.required && (!this.data || !this.data.length)) return reply(`${this.$props.title} is required`);
			if (this.$props.min && _.isString(this.data) && this.data.length < this.$props.min) return reply(`${this.$props.title} must have at least ${this.$props.min} items`);
			if (this.$props.max && _.isString(this.data) && this.data.length > this.$props.max) return reply(`${this.$props.title} must have at most ${this.$props.max} items`);
		});
	},
	methods: {
		addItem() {
			if (!_.isArray(this.data)) this.data = [];
			this.data.push(this.newItem);
			this.newItem = '';
		},
		changeItem(index, value) {
			this.$set(this.data, index, value);
		},
		removeItem(index) {
			this.data = this.data.filter((x, i) => i != index);
		},
	},
});
</script>

<template>
	<table class="table table-bordered mg-list">
		<tbody>
			<tr v-for="(row, rowIndex) in data" :key="rowIndex">
				<td v-if="$props.numbered" class="row-number-cell">{{rowIndex + 1 | number}}</td>
				<td>
					<input :value="row" @change="changeItem(rowIndex, $event.srcElement.value)" type="text" class="form-control"/>
				</td>
				<td v-if="$props.allowDelete" class="verb-cell">
					<a @click="removeItem(rowIndex)" class="btn btn-link btn-link-danger btn-xs text-muted"><i class="fa fa-trash"></i></a>
				</td>
			</tr>
		</tbody>
		<tfoot class="hidden-print">
			<tr>
				<td v-if="$props.numbered" class="row-number-cell">
					<a v-if="!$props.allowDelete" @click="addItem()" :class="newItem ? $props.addButtonActiveClass : $props.addButtonInactiveClass"/>
					<i v-if="$props.allowDelete" class="far fa-asterisk"></i>
				</td>
				<td :colspan="$props.allowDelete ? 1 : 2">
					<input @keyup.enter="addItem()" v-model="newItem" type="text" class="form-control"/>
				</td>
				<td v-if="$props.allowDelete" class="verb-cell">
					<a @click="addItem()" :class="newItem ? $props.addButtonActiveClass : $props.addButtonInactiveClass"/>
				</td>
			</tr>
		</tfoot>
	</table>
</template>

<style>
/* Cell padding */
.mg-list td {
	padding: 0px !important;
}

.mg-list td input[type="text"] {
	border: none;
}

/* Row number cell */
.mg-list td.row-number-cell {
	text-align: center;
	width: 30px;
	vertical-align: middle;
}

/* Verb cell */
.mg-list .verb-cell {
	width: 30px;
	text-align: center;
	vertical-align: middle;
}
</style>
