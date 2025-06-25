<script lang="js" frontend>
app.component({
	route: '/profile',
	data() { return {
		data: {
			username: undefined,
			email: undefined,
			name: undefined,
		},
		/* MG2 implementation {{{
		spec: {
			type: 'mgContainer',
			layout: 'card',
			items: [
				{
					type: 'mgText',
					id: 'username',
					title: 'Username',
					disabled: true,
					showIf: () => !this.$config.session.signup.emailAsUsername
				},
				{
					type: 'mgEmail',
					id: 'email',
					title: 'Email',
					disabled: true,
				},
				{
					type: 'mgText',
					id: 'name',
					title: 'Name',
				},
				{
					type: 'mgCode',
					id: 'settings',
					title: 'Settings',
				},
			]
		},
		}}} */
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/session`))
				.then(({data}) => this.data = data)
				.then(()=> this.$sitemap.setTitle(this.data.name || this.data.username || this.data.email))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
		save(notification = false, redirect = false) {
			console.log('Save disabled.');
			return Promise.resolve();
			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					//if (!this.data.username) throw new Error('No username provided');
					if (!this.data.name) throw new Error('No name provided');
				})
				// }}}
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/session`, this.data))
				.then(()=> notification && this.$toast.success('Saved'))
				.then(()=> redirect && this.$router.push('/'))
				.then(()=> !redirect && this.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debug.enable(false);
		return this.refresh();
	},
});
</script>

<template>
	<form class="form-horizontal h-100" @submit.prevent="save(true, false)">
		<!--div class="btn-group-float">
			<button
				v-tooltip="'Save'"
				type="submit"
				class="btn btn-icon btn-lg btn-circle btn-success"
				><i class="fa fa-check" /></button>
		</div-->

		<div class="row h-100">
			<!-- TODO: scrollspy/anchor navigation
			<div class="col-3">
				<div class="sticky-top py-3">
					<div class="card">
						<div class="list-group-flush">
							<a class="list-group-item list-group-item-action" href="#account">My account</a>
							<a class="list-group-item list-group-item-action" href="#subscription">Subscription</a>
						</div>
					</div>
				</div>
			</div>
			-->
			<div class="col-lg-9 py-3">
				<!-- My account -->
				<div id="account" class="card">
					<div class="card-header border-bottom">
						My account
					</div>
					<div class="card-body">
						<div class="form-group">
							<label class="col-form-label">Name</label>
							<input v-model="data.name" type="text" class="form-control">
						</div>
						<div class="form-group">
							<label class="col-form-label">Email</label>
							<input v-model="data.email" type="text" class="form-control" disabled>
						</div>
						<div class="form-group">
							<label class="col-form-label">Password</label>
							<div>
								<a href="/reset" class="btn btn-dark">Reset Password</a>
							</div>
						</div>
					</div>
				<!-- My account -->
				<!-- Subscription -->
				</div>
				<div id="subscription" class="card">
					<div class="card-header border-bottom">
						Subscription
					</div>
					<div class="card-body">
						<div class="alert alert-secondary">
							<div class="d-flex justify-content-between">
								<div class="py-1">
									You currently do not have a subscription.
								</div>
								<div class="text-right ml-auto">
									<a class="btn btn-success ml-auto" href="">
										{{FIXME ? 'Switch plan' : 'Subscribe'}}
									</a>
									<br>
									<a class="btn btn-link" v-if="FIXME" href="">Cancel plan</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- Subscription -->
			</div>
		</div>

		<div v-if="$debug.$enable" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</form>
</template>

