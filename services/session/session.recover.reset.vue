<script lang="js" frontend>
app.component({
	route: '/recover/:token',
	routeRequiresAuth: false,
	data: ()=> ({
		data: {
			password: '',
			confirmation: '',
		},
	}),
	methods: {
		recover(notification = false, redirect = false) {

			const doc = { password: this.data.password };

			return Promise.resolve()
				// Sanity checks {{{
				.then(()=> {
					if (!this.data.password) throw new Error('No password provided');
					// 5.1.1.2 Memorized Secret Verifiers
					// Verifiers SHALL require subscriber-chosen memorized secrets to be at least 8 characters in length.
					// https://pages.nist.gov/800-63-3/sp800-63b.html
					if (this.data.password.length < 8) throw new Error('Password below minimum length of 8 characters');
					if (this.data.password !== this.data.confirmation) throw new Error('Passwords do not match');
				})
				// }}}
				.then(()=> this.$loader.start())
				.then(()=> this.$http.post(`/api/users/${this.$session.data._id}`, doc))
				.then(()=> notification && this.$toast.success('Updated password saved'))
				// Logout after setting password, giving user memory prompt and opportunity for browser to save
				.then(()=> this.$session.logout())
				.then(()=> redirect && this.$router.push('/'))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},

	},

	// Bind special Login styles
	beforeCreate: ()=> $('body').addClass('minimal').removeClass('bootstrapping'),
	destroyed: ()=> $('body').removeClass('minimal'),
});
</script>

<template>
	<div class="session-float d-flex flex-column vh-100">
		<sitenav class="position-fixed vw-100" />
		<div class="container flex-grow-1">
			<div class="row h-100 align-items-center justify-content-center py-5 py-lg-6">
				<div class="d-none d-lg-block col-lg-6 pr-lg-4">
					<h4>
						<strong>
							Chatstat — an valuable supplement to every analyst’s, investor’s or researcher’s&nbsp;toolbox.
						</strong>
					</h4>
					<p class="lead">
						Enhance your financial due diligance. Chatstat allows you to monitor and analyze social sentiment and trends of the average Joe to the&nbsp;influential.
					</p>
					<a class="btn btn-dark" v-href="'/faq'">Learn more <i class="fas fa-long-arrow-right ml-1"></i></a>
				</div>
				<div class="col-sm-10 col-md-8 col-lg-6">
					<h4 class="d-lg-none text-center mb-4">Welcome back!</h4>
					<form class="card bg-light shadow">
						<div class="card-body p-4">
							<div class="form-horizontal">
								<div>
									<div class="form-group mb-3">
										<label class="form-label" for="">
											<small class="font-weight-bold">Password</small>
										</label>
										<div class="input-group input-group-lg">
											<div class="input-group-prepend">
												<span class="input-group-text">
													<i class="fal fa-fw fa-user"/>
												</span>
											</div>
											<input type="password" name="password" v-model="data.password" class="form-control" required autofocus/>
										</div>
									</div>

									<div class="form-group mb-3">
										<label class="form-label" for="">
											<small class="font-weight-bold">Confirmation</small>
										</label>
										<div class="input-group input-group-lg">
											<div class="input-group-prepend">
												<span class="input-group-text">
													<i class="fal fa-fw fa-user"/>
												</span>
											</div>
											<input type="password" name="confirmation" v-model="data.confirmation" class="form-control" required/>
										</div>
									</div>
									<button type="submit" v-on:click.prevent="recover(true, true)" class="btn btn-primary btn-lg btn-block">Reset</button>
								</div>
								<hr size="0">
								<small class="text-muted text-center">
									<p class="mb-0">
										Log into your account — <a href="/login" class="btn btn-sm btn-link align-baseline p-0">Login</a>
									</p>
									<p class="mb-0">
										I don't have an account — <a href="/signup" class="btn btn-sm btn-link align-baseline p-0">Create an account</a>
									</p>
								</small>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
.session-float {
	z-index: 150; /* Appear on top of particles splash screen */
	position: absolute;
	top: 0px;
	left: 0px;
	right: 0px;
	bottom: 0px;
	overflow: auto;
	display: flex;
	background: var(--main);
}

.session-float .card {
	border-radius: 5px;
}

.session-float .footer {
	z-index: 1000;
}
</style>
