<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgTable').enable(false);

import _ from 'lodash';

export default app.mgComponent('mgTable', {
	meta: {
		title: 'Table layout',
		icon: 'far fa-table',
		category: 'Layout',
	},
	data() { return {
		newRow: {},
		// TODO: Is this really needed? Perhaps when `url` is specified?
		isAdding: false,
		data: [],
	}},
	props: {
		url: {type: 'mgUrl', relative: true, help: 'Data feed to populate the table'},
		allowAdd: {type: 'mgToggle', title: 'Allow Row Addition', default: true},
		allowDelete: {type: 'mgToggle', title: 'Allow Row Deletion', default: true},
		textEmpty: {type: 'mgText', title: 'No data message', default: 'No data'},
		items: {
			type: 'mgAlert',
			vueType: 'array',
			text: 'Use the editor to define child widgets',
			default: () => [
				// FIXME: Defaults are not initialised
				{id: 'col1', title: 'Col 1', type: 'mgText', default: '1'},
				{id: 'col2', title: 'Col 2', type: 'mgText', default: '2'},
			],
		},
		addButtonActiveClass: {type: 'mgText', default: 'btn btn-block btn-success fa fa-plus', advanced: true},
		addButtonInactiveClass: {type: 'mgText', default: 'btn btn-block btn-disabled fa fa-plus', advanced: true},
		rowNumbers: {type: 'mgToggle', help: 'Show the row number at the beginning of each row', default: true},
	},
	childProps: {
		showTitle: {type: 'mgToggle', default: false, title: 'Show Title'},
	},
	created() {
		$debug().enable(false);
	},
	mounted() {
		this.$watch('$props.url', ()=> {
			if (!this.$props.url) return;
			this.$macgyver.utils.fetch(this.$props.url, {type: 'array'})
				.then(data => this.$set(this.$props, 'data', data))
		}, {immediate: true});
	},
	watch: {
		data: {
			immediate: true,
			handler() {
				// Ensure that data is always an array
				if (!_.isArray(this.data)) this.data = [];
			},
		},
	},
	// To ensure reactivity to array of objects https://stackoverflow.com/a/56793403/2438830
	computed: {
		outerKey() {
			return this.data && this.data.length;
		}
	},
	methods: {
		createRow(offset) { // Offset is the row to create after - i.e. array position splice
			$debug('createRow', offset, this.$data.newRow);
			this.isAdding = true;
			if (typeof offset === 'undefined') {
				this.data.push(this.$data.newRow);
			} else {
				this.data.splice(offset, 0, this.$data.newRow);
			}
			this.$data.newRow = {};
			this.isAdding = false;
		},
		deleteRow(offset) {
			// TODO: Add confirmation dialog?
			$debug('deleteRow', offset);
			this.data.splice(offset, 1);
		},
	},
});
</script>

<template>
	<div class="mg-table">
		<table class="table table-bordered table-striped table-hover">
			<thead>
				<tr>
					<th v-if="$props.rowNumbers" class="row-number">&#35;</th>
					<th v-for="col in $props.items" :key="col.id" :style="(col.width ? 'width: ' + col.width + '; ' : '') + col.class">
						{{col.title}}
					</th>
					<th v-if="$props.allowAdd || $props.allowDelete" class="btn-context">&nbsp;</th>
				</tr>
			</thead>
			<tbody :key="outerKey">
				<tr v-if="!data || !data.length">
					<td :colspan="$props.items.length + ($props.rowNumbers ? 1 : 0) + (($props.allowAdd || $props.allowDelete) ? 1 : 0) + 1">
						<div class="alert alert-warning m-10">{{$props.textEmpty || 'No data'}}</div>
					</td>
				</tr>
				<tr v-for="(row, rowNumber) in data" :key="rowNumber">
					<td v-if="$props.rowNumbers" class="row-number">
						{{rowNumber + 1 | number}}
					</td>
					<td v-for="col in $props.items" :key="col.id" :class="col.class">
						<!-- Works -->
						<!--mg-text
							:value="row[col.$dataPath]"
							@change="$setPath(row, col.$dataPath, $event)"
						/-->

						<!-- Works -->
						<!-- FIXME: Missing show? v-if="col.show" -->
						<mg-form
							:config="col"
							:data="row"
							@changeItem="$setPath(row, $event.path, $event.value)"
						/>

						<!-- // FIXME: Should pass through value and change events properties? -->
						<!--mg-component
							:config="{
								id: col.id,
								type: col.type,
							}"
							:value="row[col.$dataPath]"
							@change="$setPath(row, col.$dataPath, $event)"
						/-->
					</td>
					<td v-if="$props.allowAdd || $props.allowDelete" class="btn-context">
						<div class="btn-group">
							<a class="btn btn-context" data-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></a>
							<ul class="dropdown-menu pull-right">
								<li v-if="$props.allowAdd"><a @click="createRow(rowNumber)"><i class="fas fa-arrow-circle-up"></i> Add row above</a></li>
								<li v-if="$props.allowAdd"><a @click="createRow(rowNumber)"><i class="fas fa-arrow-circle-down"></i> Add row below</a></li>
								<li v-if="$props.allowDelete" class="dropdown-divider"></li>
								<li v-if="$props.allowDelete" class="dropdown-item-danger"><a @click="deleteRow(rowNumber)"><i class="fas fa-trash"></i> Delete</a></li>
							</ul>
						</div>
					</td>
				</tr>
				<tr class="mgTable-append" v-if="$props.allowAdd">
					<td v-if="$props.rowNumbers" class="row-number">
						<i class="far fa-asterisk"></i>
					</td>
					<td v-for="(col, colNumber) in $props.items" :key="col.id || colNumber">
						<!-- Works -->
						<!--mg-text
							:value="newRow[col.$dataPath]"
							@change="$setPath(newRow, col.$dataPath, $event)"
						/-->

						<!-- Works -->
						<mg-form
							:config="col"
							:data="newRow"
							@changeItem="$setPath(newRow, $event.path, $event.value)"
						/>
					</td>
					<td>
						<a @click="createRow()" :class="isAdding ? $props.addButtonActiveClass : $props.addButtonInactiveClass"></a>
					</td>
				</tr>
			</tbody>
		</table>

		<div v-if="$debugging" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>

		<!--div v-if="$debugging" class="card">
			<div class="card-header">
				Raw properties
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$props}}</pre>
			</div>
		</div-->
	</div>
</template>

<style>
.mg-table .row-number {
	font-size: 16px;
	text-align: middle;
}

.mg-table td.row-number {
	margin-top: 14px;
}
</style>
