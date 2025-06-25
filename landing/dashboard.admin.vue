<script lang="js" frontend>
app.component('adminDashboard', {
	data() { return {
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> Promise.all([
				]))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		return this.refresh();
	},
});
</script>

<template>
	<main class="d-flex flex-column h-100">
		<div class="row mx-n2">
			<div class="col-6 col-sm-3 px-2">
				<div class="card shadow-sm h-100">
					<div class="card-body py-2">
						<div class="display-4 mt-n1">
							90
						</div>
						<span class="text-muted">New accounts created this month</span>
					</div>
				</div>
			</div>
			<div class="col-6 col-sm-3 px-2">
				<div class="card shadow-sm h-100">
					<div class="card-body py-2">
						<div class="display-4 mt-n1">
							2211
						</div>
						<span class="text-muted">Premium subscribers</span>
					</div>
				</div>
			</div>
			<div class="col-6 col-sm-3 px-2">
				<div class="card shadow-sm h-100">
					<div class="card-body py-2">
						<div class="display-4 mt-n1">
							73
						</div>
						<span class="text-muted">New subcribers</span>
					</div>
				</div>
			</div>
			<div class="col-6 col-sm-3 px-2">
				<div class="card shadow-sm h-100">
					<div class="card-body py-2">
						<div class="display-4 mt-n1">
							9.5%
						</div>
						<span class="text-muted">Conversion rate</span>
					</div>
				</div>
			</div>
		</div>

		<div class="row mx-n2 flex-grow-1">
			<div class="col-12 mt-4 px-2">
				<div class="card shadow-sm h-100">
					<div class="card-header border-bottom">
						<div class="dropdown">
							<a class="dropdown-toggle" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								User growth
							</a>
							<div class="dropdown-menu">
								<a class="dropdown-item" href="">User growth</a>
								<a class="dropdown-item" href="">Conversion rate</a>
								<a class="dropdown-item" href="">Earnings</a>
							</div>
						</div>
					</div>
					<div class="card-body pb-3">
						<div class="bg-light h-100" style="min-height: 300px"></div>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
