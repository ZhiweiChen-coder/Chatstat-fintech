<script lang="js">
//import Debug from '@doop/debug';
//const $debug = Debug('mgPermissions').enable(false);

import _ from 'lodash';

// FIXME: Is this more of an app level component?\
export default app.mgComponent('mgPermissions', {
	meta: {
		title: 'Permissions',
		icon: 'far fa-key',
		category: 'System Administration',
		preferId: true,
	},
	props: {
		textEmpty: {type: 'mgText', help: 'Text to display when no permissions are set', default: 'No permissions selected'},
		permissionsFeed: {type: 'mgUrl', relative: true, default: '/api/users/meta', advanced: true, help: 'The data source to import user permissions', relative: true},
	},
	created() {
		this.$watch('data', ()=> {
			// TODO: Handle like SIFT is handled.
			if (_.isString(this.data)) this.$set(this, 'data',
				/\|\|/.test(this.data) ? this.data.split(/\s*\|\|\s*/) // `foo || bar` -> ['foo', 'bar']
				: [this.data]
			);
		}, {immediate: true});
	},
	methods: {
		edit() {
			Promise.resolve()
				.then(()=> this.$macgyver.notify.loading(this._uid, true))
				.then(()=> this.$http.get(this.$props.permissionsFeed).catch(this.$toast.catch))
				.tap(()=> this.$macgyver.notify.loading(this._uid, false))
				.then(res => this.$prompt.macgyver({
					title: 'Select permissions',
					form: [
						{
							id: 'class',
							type: 'mgChoiceCheckbox',
							showTitle: false,
							classWrapper: '',
							sort: 'sortId',
							enum: _.chain(res.data)
								.pickBy((v, k) => k.startsWith('permissions.'))
								.map(v, (v, k) => ({
									id: k.replace(/^permissions\./, ''),
									title: Vue.filter('permissionCase')(k.replace(/^permissions\./, '')),
								}))
								.value()
						},
					],
					data: {
						class: _.clone(this.data),
					},
				}))
				.then(form => this.data = form.class)
				.catch(e => {}) // Ignore rejection - was probably the user cancelling the permission set
		},
	},
});
</script>

<template>
	<a @click="edit()" class="form-control-static">
		<span v-for="permission in data" :key="permission" class="badge badge-info">
			{{permission | permissionCase}}
		</span>
		<span v-if="!data || !data.length" class="font-italic text-muted">
			{{$props.textEmpty}}
		</span>
	</a>
</template>
