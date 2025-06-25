<script lang="js" frontend>
app.component('userDashboardtemplate', {
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
	<!-- TODO: Fix height offset -->
	<main class="h-100">
		<div class="card h-100">
			<div class="card-header border-bottom">
				Top searches
			</div>
			<div class="card-body p-0">
				<div class="row h-100 m-0">
					<!-- Sidebar {{{ -->
					<div class="col-auto h-100 overflow-auto border-right p-0" style="width: 15rem;">
						<div class="list-group list-group-flush">
							<a class="list-group-item list-group-item-action active">
								Meme stocks
							</a>
							<a class="list-group-item list-group-item-action">
								Climate crisis
							</a>
							<a class="list-group-item list-group-item-action">
								Short the market
							</a>
							<a class="list-group-item list-group-item-action">
								Semiconductor Battle Royale
							</a>
							<a class="list-group-item list-group-item-action">
								Crypto
							</a>
						</div>
					</div>
					<!-- }}} -->

					<!-- Content {{{ -->
					<div class="col h-100 px-3 py-2">
						<!-- Content header {{{ -->
						<header class="d-flex">
							<div class="flex-grow-1">
								<h3 class="mb-1">Meme stocks</h3>
								<!-- Keywords list {{{ -->
								<div>
									<span class="badge badge-info h5">Moon</span>
									<span class="badge badge-info h5">Diamond hands</span>
									<span class="badge badge-info h5">Gamestop</span>
									<span class="badge badge-info h5">GME</span>
									<a class="small text-dark text-decoration-none text-nowrap">+ 2 more Keywords</a>
								</div>
								<!-- }}} -->
							</div>
							<div class="text-right ml-auto">
								<a class="badge badge-pill badge-light">
									<i class="far fa-bell-slash"></i>
									Notifications
								</a>
								<a class="badge badge-pill badge-light">
									<i class="far fa-copy"></i>
									Copy to your Charts
								</a>
							</div>
						</header>
						<!-- }}} -->

						<!-- Form {{{ -->
						<form class="form-inline mt-2 mx-n1">
							<div class="form-group mx-1">
								<div class="input-group">
									<div class="input-group-prepend">
										<div class="input-group-text">
											<i class="fab fa-fw fa-twitter"></i>
										</div>
									</div>
									<select class="form-control" name="" id="">
										<option value="">Elon Musk</option>
									</select>
								</div>
							</div>
							<div class="form-group mx-1">
								<div class="input-group">
									<div class="input-group-prepend">
										<div class="input-group-text">
											<i class="far fa-fw fa-money-bill-wave"></i>
										</div>
									</div>
									<select class="form-control" name="" id="">
										<option value="">NYSE: GME</option>
										<option value="">NYSE: BB</option>
										<option value="">NYSE: AMC</option>
									</select>
								</div>
							</div>
						</form>
						<!-- }}} -->
						<!--  {{{ -->
						<div class="nav nav-tabs nav-bordered align-items-end mt-4">
							<div class="nav-item mr-auto">
								<div class="text-muted mb-1">GameStop Corp.</div>
								<span class="h3 mr-1">87.23</span>
								<span class="text-warning">▼ 8.00 (12.34%)</span>
								<div class="nav nav-pills mt-1 mb-2">
									<a class="nav-link mr-1 px-1 py-0" href="">1D</a>
									<a class="nav-link mr-1 px-1 py-0 active nav-link" href="">5D</a>
									<a class="nav-link mr-1 px-1 py-0" href="">1M</a>
									<a class="nav-link mr-1 px-1 py-0" href="">6M</a>
									<a class="nav-link mr-1 px-1 py-0" href="">MAX</a>
								</div>
							</div>
							<a class="nav-link mr-1 active" href="">Chart</a>
							<a class="nav-link" href="">Timeline</a>
						</div>
						<riversview/>
						<!-- }}} -->
					</div>
					<!-- }}} -->
				</div>
			</div>
		</div>
	</main>
</template>
