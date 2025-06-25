<script lang="js">
import Debug from '@doop/debug';
const $debug = Debug('mgQuery').enable(false);

import _ from 'lodash';

export default app.mgComponent('mgQuery', {
	meta: {
		title: 'Query',
		icon: 'far fa-filter',
		category: 'Data display',
	},
	data() { return {
		//data: {'$or': [{name: 'foo'}]},
		queryComponent: {
			type: "mgContainer",
			layout: "query",
			items: []
		}
	}},
	props: {
		id: {
			type: 'mgString',
		},
		//config: Object,
		/**
		* The spec is composed of an object lookup with the dotted notation path as the key and an object set of properties
		* @property {string} [type='string'] The type of the field, used to determine the component to use as the value input
		* @property {boolean} [showOperand=true] Whether to allow the user to select the operand ("Equals", "Is in" etc.) if false this only allows straight equality
		* @property {array <string>|array <object>|string} [enum] If the type is a string this restricts operand values to a list of selectable values. The value can also be one of the following meta values: '$FIELDS' - list all spec fields
		*/
		//spec: {type: 'mgCode', syntax: 'json'},
		spec: { // FIXME: Test case
			type: Object,
			default: () => ({
				//_id: {type: 'objectId'},
				name: {type: 'string'},
				/*
				username: {type: 'string'},
				email: {type: 'string'},
				'address.street': {type: 'string'},
				'address.city': {type: 'string'},
				'address.zip': {type: 'string'},
				'address.state': {type: 'string'},
				'address.country': {type: 'string'},
				phone: {type: 'string'},
				website: {type: 'string'},
				'company.name': {type: 'string'},
				role: {type: 'string', enum: ['user', 'admin', 'root']},
				status: {type: 'string', enum: ['pending', 'active', 'deleted']},
				lastLogin: {type: 'date'},
				*/
				sort: {type: 'string', showOperand: false, enum: '$FIELDS'},
				limit: {type: 'number', showOperand: false},
				skip: {type: 'number', showOperand: false},
			}),
		},
	},
	created() {
		this.$debug = $debug;

		this.$watchAll([
			'$props.url',
			'$props.spec',
		], this.refresh, {immediate: true}); // FIXME: deep?
	},
	methods: {
		refresh() {
			//this.data = {'$or': [{name: 'foo'}]};
			this.data = { name: { '$eq': 'foo' }};
			$debug('refresh', _.cloneDeep(this.data), _.cloneDeep(this.$props.spec));
			if (!_.isPlainObject(this.data)) this.data = {};
			//if (!_.isPlainObject(this.$props.spec)) return;

			// Calculate which fields we can use in enums
			var fieldsEnum = Object.keys(this.$props.spec)
				.map(key => ({
					id: key,
					title: _.startCase(key),
				}));
			$debug('fieldsEnum', fieldsEnum);

			/**
			* Populate enum values from a spec branch
			* Really this just deals with meta cases like '$FIELDS' (see spec definition for 'enum')
			* @param {Object} pathSpec The path branch specification
			* @returns {array} An mgChoice* compatible ENUM composed of {id, title}
			*/
			var populateEnum = pathSpec =>
				pathSpec.enum === '$FIELDS' ? fieldsEnum
					: pathSpec.enum;

			this.queryComponent.items = Object.keys(this.data)
				.map((path, pathIndex) => // Examine each path key
					Object.keys(typeof this.data[path] == 'object' ? this.data[path] : {$eq: this.data[path]}) // Examine each operand key
						.map((operand, operandIndex) => {
							var value = this.data[path];
							var pathSpec = this.spec[path] || {unknown: true, type: 'string'};

							var row = {
								// FIXME: Incremental, unique
								id: 'id' + _.random(10000,99999),
								type: 'mgContainer',
								layout: 'query-row',
								items: [
									{
										type: 'mgChoiceDropdown',
										enum: fieldsEnum,
										default: path,
										onChange: value => {
											if (_.isPlainObject(this.data[path])) { // Multiple value setter
												console.log('Change field with other operands', path, 'to', value, {leaf: this.data[path]});
												delete this.data[path][operand];
												this.data[value][operand] = '';
											} else { // Single value setter
												console.log('Change simple field', path, 'to', value, {leaf: this.data[path]});
												delete this.data[path];
												this.data[value] = '';
											}
											this.refresh();
										},
									},
									{
										type: 'mgChoiceDropdown',
										enum: [
											...(['string', 'number'].includes(pathSpec.type) ? [
												{id: '$eq', title: 'Equals'},
												{id: '$ne', title: 'Does not equal'},
											] : []),

											...(pathSpec.type == 'date' ? [
												{id: '$eq', title: 'Is on'},
												{id: '$ne', title: 'Is not on'},
											] : []),

											{id: '$exists', title: 'Is present'},

											...(pathSpec.type != 'date' ? [
												{id: '$in', title: 'Is one of'},
												{id: '$nin', title: 'Is not one of'},
											] : []),

											...(pathSpec.type == 'number' ? [
												{id: '$gt', title: 'Is greater than'},
												{id: '$gte', title: 'Is equal or greater than'},
												{id: '$lt', title: 'Is less than'},
												{id: '$lte', title: 'Is equal or less than'},
											] : []),

											...(pathSpec.type == 'date' ? [
												{id: '$gt', title: 'Is after'},
												{id: '$gte', title: 'Is on or after'},
												{id: '$lt', title: 'Is before'},
												{id: '$lte', title: 'Is on or before'},
											] : []),
										],
										default: operand,
										onChange: value => {
											debugger;
											if (_.isPlainObject(this.data[path])) { // Multiple operand setter
												console.log('Change nested operand for path', path, 'to', value);
												delete this.$data[path][operand];
												this.$data[path].$eq = value;
											} else if (value == '$eq') { // Single operand setter
												console.log('Change simple operand for path', path, 'to', value);
												this.data[path] = value;
											} else {
												this.data[path] = {
													...(_.isPlainObject(this.data[path]) ? this.data : null),
													[value]: '',
												};
											}
											this.refresh();
										},
									},
								],
							};

							if (value === undefined) { // Special case for when a path operand hasn't been defined yet - usually just after the user has added a new path or tried to change an existing one
								// Pass
							} else if (['$eq', '$ne'].includes(operand) && pathSpec.enum) {
								row.items.push({
									type: 'mgChoiceDropdown',
									enum: populateEnum(pathSpec),
									default: value,
								});
							} else if (['$eq', '$ne'].includes(operand) && pathSpec.type == 'string') {
								row.items.push({type: 'mgText', default: value});
							} else if (['$eq', '$ne'].includes(operand) && pathSpec.type == 'number') {
								row.items.push({type: 'mgNumber', default: value});
							} else if (['$eq', '$ne'].includes(operand) && pathSpec.type == 'date') {
								row.items.push({type: 'mgDate', default: value});
							} else if (operand == '$exists') {
								row.items.push({
									type: 'mgToggle',
									onText: 'yes',
									offText: 'no',
									default: value,
								});
							} else if (operand == '$in' || operand == '$nin') {
								row.items.push({
									type: 'mgChoiceTags',
									default: value,
									enum: populateEnum(pathSpec),
								});
							} else {
								row.items.push({
									type: 'mgError',
									text: `Unsupported operand "${operand}"`,
								});
							}

							return row;
						})
				)
				.reduce((t, v) => t.concat(v), []); // Flatten
		},

		//changeField(path, value) {
		//	console.log('Change', path, '=', value);
		//},
	},
});
</script>

<template>
	<div>
		<mg-form
			:form="`${$props.id}-subform`"
			:config="queryComponent"
		/>
		
		<div v-if="this.$debug.$enabled" class="card">
			<div class="card-header">
				Raw data
			</div>
			<div class="card-body">
				<pre>{{data}}</pre>
			</div>
		</div>

		<div v-if="this.$debug.$enabled" class="card">
			<div class="card-header">
				Raw spec
			</div>
			<div class="card-body">
				<pre>{{queryComponent}}</pre>
			</div>
		</div>
	</div>
</template>
