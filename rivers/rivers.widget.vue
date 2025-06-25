<script lang="js" frontend>

app.component('riversWidget', {
	data() {
		return {
			flow: undefined,
			river: undefined,
			data: undefined,
			riverApply: undefined,
			addTermVar: undefined,
			form: undefined,
			formFlow: undefined,
			// DEMO: Tesla chart data
			teslaPrices: [],
			teslaTweets: []
		};
	},
	props: {
		riverApiCall: { type: String, default: '' },
		riverTitleCard: { type: String, default: 'Charts' },
		platformApiCall: { type: String },
		mode: { type: String, default: 'timeline' }, // ENUM chart, timeline
		id: { type: String },
		rivers: { type: Array },
		href: { type: Boolean, default: true }
	},
	methods: {
		/**
		 * Retrieves list of rivers and selects by id when provided
		 * @returns {Promise} Resolves when API request is complete
		 */
		//Fixme: db.users.findOneAndUpdate({email: 'adam@mfdc.io'}, {$set: {'permissions.riversGlobalCreate': true}})

		refresh() {
			this.$debug('refresh', this.riverApiCall, this.$props.id, this.data);
			return Promise.resolve()
				.then(() => this.$loader.startBackground())
				.then(() => this.riverApiCall && this.$http.get(this.riverApiCall, {
					params: { select: '_id,title' }
				}))
				.then(({ data }) => this.riverApiCall ? this.data = data : undefined)
				.then(() => {
					if (!this.data || this.data.length === 0) return; // Skip selection when data is empty
					(this.$props.id)
						? this.select(this.$props.id)
						: this.select(this.data[0]._id)
				})
				.catch(this.$toast.catch)
				.finally(() => this.$loader.stop());
		},

		/**
		 * Select a River for display
		 * @param {string} id The ID to be selected
		 * @returns {Promise} Resolves when API request is complete
		 */
		select(id) {
			if (!id) return;

			// Invalidate existing river to avoid triggering computed properties
			//this.river = undefined; // FIXME: Hide during loading, this was breaking computed subscriptions
			//this.$set(this.river, 'flow', undefined);
			this.$debug('existing', this.river);
			//if (this.river?.flow) this.river.flow = undefined;
			//this.flow = {};

			this.$debug('select', id);
			if (id === 'new') return this.$router.push('/rivers/edit/new');

			// Check data first so we can test keys
			const found = this.data.find(r => r._id === id);
			// Provided data already has the details
			const hasDetails = found && !Object.keys(found).every(r => ['_id', 'title'].includes(r));
			this.$debug('hasDetails', hasDetails);
			return Promise.resolve()
				.then(() => this.$loader.startBackground())
				.then(() => this.riverApiCall && !hasDetails && this.$http.get(`${this.riverApiCall}/${id}`))
				.then(({ data }) => {
					// By updating flow before river, we avoid triggering watches twice on period change
					if (data) {
						this.flow = data.flows[0];
						this.river = data;
					} else {
						this.flow = found.flows[0];
						this.river = found
					}
				})
				.then(() => this.form = this.river)
				.then(() => this.$debug('selected', this.river, this.flow))
				.then(() => {
					// Note: do not use dynamic page title on promo site
					// FIXME: will checking session variable be enough for this?
					if (this.$session.isLoggedIn) {
						this.$sitemap.setBreadcrumbs([
							{ title: 'Charts', href: '/rivers' },
							{ title: this.river.title },
						]);
					}
					// Maybe use (check with client)?
					// else {
					// 	this.$sitemap.setBreadcrumbs([
					// 		{title: 'Social Investment Insight & Alerts'},
					// 	]);
					// }
				})
				.catch(this.$toast.catch)
				.finally(() => this.$loader.stop())
		},

		/**
		 * Remove a River from the database
		 * @param {boolean} notifaction Flash a toast notification
		 * @param {boolean} redirect Redirect browser after action
		 * @returns {Promise} Resolves when API request is complete
		 */
		remove() {
			if (!this.riverApiCall) return;

			return Promise.resolve()
				.then(() => this.$loader.start())
				.then(() => this.$http.delete(`${this.riverApiCall}/${this.river._id}`))
				.then(() => this.$toast.success('Deleted'))
				.then(() => this.river = undefined)
				.then(() => this.$router.push('/rivers/'))
				.then(() => this.refresh())
				.catch(this.$toast.catch)
				.finally(() => this.$loader.stop())
		},
		save(notification = true) {
			return Promise.resolve()
				.then(() => this.$loader.startBackground())
				.then(() => this.$route.params.id === 'new' ? this.$http.post('/api/rivers', this.river) : this.$http.post(`/api/rivers/${this.river._id}`, this.river))
				.then(() => notification && this.$toast.success('Saved'))
				.then(() => this.$sitemap.setBreadcrumbs([
					{ title: 'Charts', href: '/rivers' },
					{ title: this.river.title, href: `/rivers/${this.river._id}/edit` },
				]))
				.catch(this.$toast.catch)
				.finally(() => this.$loader.stop())
		},
		async switchNotifications() {
			this.river.notifications = !this.river.notifications
			await this.save();
		},
		async addTags(item, index) {
			this.river.terms[index].isActive = !this.river.terms[index].isActive
		},
		addTerms: function (e) {
			let isRepeat = false;
			if (this.river.static) {
				$('#modal-restricted-feature').modal('show')
			} else {
				this.river.terms.forEach(term => {
					if (term.term == this.addTermVar) {
						isRepeat = true
					}
				});
				if (!isRepeat) {
					this.river.terms.push({ term: this.addTermVar, isActive: true })
				}
			}
		},

		/**
		* Triggered when the search text changes.
		*
		* @param {Object} target Pointer to key within form
		* @param {String} search Current symbol search text
		* @param {Function} loading Toggle loading class
		*/
		suggestSymbol(target, search, loading) {
			if (!target || !target.platform || !search) return;

			Promise.resolve()
				.then(() => loading(true))
				.then(() => this.$http.get(`/api/platforms/${target.platform}/suggest`, { params: {
					symbol: search,
				}}))
				// NOTE: We pass in the whole object so that $set can be used here on the array
				.then(({ data }) => this.$set(target, 'options', data))
				.finally(() => loading(false));
		},
	},
	created() {
		this.$debug.enable(false);

		// Copy props so that they can be updated internally or externally
		this.$watch('$props.rivers', () => {
			this.$debug('$watch.rivers', this.$props.rivers);
			this.$data.data = this.$props.rivers;
		}, { immediate: true, deep: true });

		// FIXME: Was thrown an error saying that $props was undefined. Doesn't make sense but leaving note for now.
		this.$watch('$props.riverApiCall', () => {
			this.$debug('$watch.riverApiCall', this.$props.riverApiCall);
			return Promise.resolve()
				.then(() => this.refresh());
		}, { immediate: true, deep: false });

		this.$watch('$props.id', () => {
			this.$debug('$watch.id', this.$props.id);
			return Promise.resolve()
				.then(() => this.select(this.$props.id));
		}, { immediate: false, deep: false });

	},
	mounted() {
		// DEMO: Fetch Tesla price and tweet data
		this.teslaPrices = [
			[1685577600000, 200], [1685664000000, 205], [1685750400000, 210], [1685836800000, 208], [1685923200000, 215]
		];
		this.teslaTweets = [
			{ date: 1685664000000, data: { text: '@elonmusk: "Tesla AI Day today!"' } },
			{ date: 1685836800000, data: { text: '@elonmusk: "New Model S delivery event!"' } }
		];
	}
});
</script>

<template>
	<main class="h-100">
		<div class="card h-100">
			<div class="card-header border-bottom">
				{{this.riverTitleCard}}
			</div>
			<div class="card-body p-0">
				<div v-if="!$loader.loading && !data" class="row h-100 m-0">
					<p class="mt-2 px-3">
						<i class="far fa-fw fa-spinner-third fa-spin text-success"></i>
						<span class="text-muted">Loading searches</span>
					</p>
				</div>
				<div v-if="data" class="widget">
					<!-- Sidebar {{{ -->
					<div class="widget__sidebar border-right">
						<!-- TODO: cell-href style callback? -->
						<div v-if="href">
							<div class="list-group-flush d-none d-lg-block">
								<a class="list-group-item list-group-item-action"
									v-for="(item, index) in data"
									:key="item._id"
									v-href="`/rivers/${item._id}/${mode}`"
									:class="{'active': river && item._id === river._id, 'border-bottom': index === data.length - 1}"
								>
									<!-- <i v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global) && river && river.global" class="fas fa-sm fa-fw fa-globe-asia"></i> -->
									{{item.title}}
								</a>
							</div>
							<div class="d-block d-lg-none border-bottom overflow-auto">
								<div class="text-nowrap mx-3 my-2 pl-2">
									<a class="badge ml-n2 mr-3"
										v-for="(item, index) in data"
										:key="item._id"
										v-href="`/rivers/${item._id}/${mode}`"
										:class="(river && item._id === river._id) ? 'badge-dark' : 'badge-light'"
									>
										<!-- <i v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global) && river && river.global" class="fas fa-sm fa-fw fa-globe-asia"></i> -->
										{{item.title}}
									</a>
								</div>
							</div>
						</div>
						<div v-if="!href">
							<div class="list-group-flush d-none d-lg-block">
								<a class="list-group-item list-group-item-action"
									v-for="(item, index) in data"
									:key="item._id"
									@click="select(item._id)"
									:class="{'active': river && item._id === river._id, 'border-bottom': index === data.length - 1}"
								>
									<!-- <i v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global) && river && river.global" class="fas fa-sm fa-fw fa-globe-asia"></i> -->
									{{item.title}}
								</a>
							</div>
							<div class="d-block d-lg-none border-bottom overflow-auto">
								<div class="text-nowrap mx-3 my-2 pl-2">
									<a class="badge ml-n2 mr-3"
										v-for="(item, index) in data"
										:key="item._id"
										@click="select(item._id)"
										:class="(river && item._id === river._id) ? 'badge-dark' : 'badge-light'"
									>
										<!-- <i v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global) && river && river.global" class="fas fa-sm fa-fw fa-globe-asia"></i> -->
										{{item.title}}
									</a>
								</div>
							</div>
						</div>
					</div>
					<!-- }}} -->
					<!-- Content {{{ -->
					<div class="widget__content px-3">
						<div v-if="river" class="d-flex flex-column justify-content-start h-100 py-2">
							<div class="d-flex">
								<div class="flex-grow-1 w-25 mr-auto" v-if="flow">
									<!-- {{flow.title}} ({{flow.platform | startCase}}:{{flow.symbol}}) -->
									<div class="d-flex align-items-center">
										<h3 class="d-inline-block text-truncate mb-0 mr-1" :title="river.title">{{river.title}}</h3>
										<!-- Global river label: only shown to admins on the river list page -->
										<span v-if="$route.path.startsWith('/rivers') && $session.hasPermission('riversGlobalCreate') && river.global" class="badge badge-dark rounded-pill text-nowrap mb-0 mr-1 py-1">
											<i class="fas fa-fw fa-sm fa-globe-asia"></i> Global
										</span>
									</div>
								</div>

								<!-- Top-right options (mobile) {{{ -->
								<div class="d-flex d-xl-none align-items-start justify-content-end mr-n1">
									<span class="mr-1">
										<button class="btn btn-sm m-0 align-text-bottom" :class="($session && ($session.hasPermission('riversGlobalCreate') || !river.global)) && river.notifications ? 'btn-success' : 'btn-light'" v-tooltip="($session && ($session.hasPermission('riversGlobalCreate') || !river.global)) && river.notifications ? 'Notifications enabled for this River' : 'Notifications are not enabled for this River'" data-toggle="modal" data-target="#modal-notifications" type="button">
											<i class="fas fa-fw" :class="($session && ($session.hasPermission('riversGlobalCreate') || !river.global)) && river.notifications ? 'fa-bell' : 'fa-bell-slash'"></i>
										</button>
									</span>
									<div class="dropdown mr-1">
										<button class="btn btn-sm btn-light" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" type="button">
											<i class="far fa-fw fa-ellipsis-v"></i>
										</button>
										<div class="dropdown-menu dropdown-menu-right">
											<a class="dropdown-item nowrap"
												data-toggle="modal" data-target="#modal-restricted-feature">
												<i class="fas fa-fw fa-bell-slash mr-1"></i> Trending Posts
												<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Be notified when your influencer&apos;s post starts trending. Perfect for meme posts'"></i>
											</a>
											<a class="dropdown-item nowrap"
												v-if="river.global"
												data-toggle="modal" data-target="#modal-restricted-feature">
												<i class="far fa-fw fa-sm fa-copy mr-1"></i> Add to watchlist
												<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Save the Chart to your Watchlist for easy viewing the next time you log in'"></i>
											</a>
											<a class="dropdown-item"
												v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global)"
												:href="`/rivers/edit/${river._id}`">
												<i class="far fa-fw fa-pencil mr-1"></i> Edit Chart
											</a>
											<a class="dropdown-item text-danger"
												v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global)"
												href="#" data-toggle="modal" data-target="#modal-delete-river">
												<i class="far fa-fw fa-trash mr-1"></i> Delete Chart
											</a>
										</div>
									</div>
								</div>
								<!-- }}} -->
								<!-- Top-right options (laptop/desktop) {{{ -->
								<div class="d-none d-xl-flex align-items-center justify-content-end flex-nowrap mr-n1">
									<a class="badge badge-light rounded-pill text-nowrap mb-0 mr-1 py-1 nowrap"
										v-if="$session && !$session.hasPermission('riversGlobalCreate') && river.global"
										data-toggle="modal"
										data-target="#modal-restricted-feature">
										<i class="fas fa-fw fa-sm fa-bell-slash"></i> Trending posts
										<i v-if="river.static" class="fas fa-fw fa-info-circle text-secondary" style="font-size: .875rem" v-tooltip.right="'Be notified when your influencer&apos;s post starts trending. Perfect for meme posts'"></i>
									</a>

									<!-- Default to faux notification off status when displayed globally -->
									<a class="badge rounded-pill text-nowrap mb-0 mr-1 py-1" :class="($session && ($session.hasPermission('riversGlobalCreate') || !river.global)) && river.notifications ? 'badge-success' : 'badge-light'" v-tooltip="($session && ($session.hasPermission('riversGlobalCreate') || !river.global)) && river.notifications ? 'Notifications enabled for this River' : 'Notifications are not enabled for this River'" data-toggle="modal" data-target="#modal-notifications" type="button">
										<i class="fas fa-fw fa-sm" :class="($session && ($session.hasPermission('riversGlobalCreate') || !river.global)) && river.notifications ? 'fa-check' : 'fa-bell-slash'"></i> Notifications
										<i v-if="river.static" class="fas fa-fw fa-info-circle text-secondary" style="font-size: .875rem" v-tooltip.right="'Receive an alert every time your influencer makes a post matching your search criteria'"></i>
									</a>
									<a class="badge badge-light rounded-pill text-nowrap mb-0 mr-1 py-1"
										v-if="$session && !$session.hasPermission('riversGlobalCreate') && river.global"
										data-toggle="modal"
										data-target="#modal-restricted-feature">
										<i class="far fa-fw fa-sm fa-copy"></i> Add to watchlist
										<i v-if="river.static" class="fas fa-fw fa-info-circle text-secondary" style="font-size: .875rem" v-tooltip.right="'Save the Chart to your Watchlist for easy viewing the next time you log in'"></i>
									</a>

									<a v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global)" class="badge badge-light rounded-pill text-nowrap mb-0 mr-1 py-1"
										:href="`/rivers/edit/${river._id}`">
										<i class="far fa-fw fa-sm fa-pencil"></i> Edit Chart
									</a>
									<a v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global)" class="badge badge-light rounded-pill text-nowrap mb-0 mr-1 py-1 text-danger"
										href="#" data-toggle="modal" data-target="#modal-delete-river">
										<i class="far fa-fw fa-sm fa-trash"></i> Delete Chart
									</a>
								</div>
								<!-- }}} -->
							</div>
							<div class="my-4">
								<div class="row mx-n2">
									<div class="col flex-grow-1 px-2" style="flex-basis: 25%">
										<div class="form-group">
											<label class="mb-1">
												Platform
												<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Choose the social media network your influencer is using'"></i>
											</label>
											<select class="custom-select">
												<option value="" selected>Twitter</option>
												<option value="" disabled>Facebook</option>
												<option value="" disabled>Reddit</option>
												<option value="" disabled>Weibo</option>
												<option value="" disabled>RSS</option>
											</select>
										</div>
										<div class="form-group mb-0">
											<label class="mb-1 nowrap">
												Name
												<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Enter the Username of the influencer. example: @elonmusk'"></i>
												<a class="mx-1 my-n1 p-1" data-toggle="dropdown" href="#" aria-haspopup="true" aria-expanded="false">Add</a>
												<div class="dropdown-menu">
													<form @submit.prevent="" class="px-2 py-0">
														<div class="row flex-nowrap mx-0">
															<div class="col px-0">
																<div class="input-group flex-grow-1 pr-1">
																	<div class="input-group-prepend">
																		<span class="input-group-text">
																			<i class="fa-fw far fa-at"></i>
																		</span>
																	</div>
																	<input
																		class="form-control"
																		type="text"
																		placeholder="Twitter handle"
																	>
																</div>
															</div>
															<div class="col-auto px-0">
																<!-- TODO: for demo modal to say it is an user feature + signup -->
																<!-- FIXME: inline way to edit and add to own river as an user -->
																<a class="btn btn-success" data-toggle="modal" data-target="#modal-restricted-feature">Add name</a>
															</div>
														</div>
													</form>
												</div>
											</label>
											<div class="dropdown">
												<button class="custom-select text-truncate text-left px-2 py-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" type="button">
													<span v-if="this.river.streams[0]" style="font-variant-numeric: tabular-nums">
														<!-- FIXME: -->
														{{this.river.streams[0].symbol}}
													</span>
													<span v-else>
														No Username Defined
													</span>
												</button>
												<div class="dropdown-menu" v-on:click.stop="">
													<form class="px-2 py-0">
														<div class="custom-control custom-checkbox" v-for="(stream, index) in river.streams">
															<input type="checkbox" class="custom-control-input" :id="`checkbox-stream-${index}`" checked>
															<label class="custom-control-label justify-content-start text-nowrap" :for="`checkbox-stream-${index}`">
																<span class="mr-1">{{stream.title}}</span>
																<span class="text-muted" v-if="stream.platform === 'twitter'">(@{{stream.symbol}})</span>
															</label>
														</div>
													</form>
												</div>
											</div>
										</div>
									</div>
									<div class="col flex-grow-1 px-2" style="flex-basis: 25%">
										<div class="form-group d-flex flex-column h-100">
											<label class="mb-1 nowrap">
													Keywords
													<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Add words or phrases to search for in your influencer&apos;s posts'"></i>
													<a class="mx-1 my-n1 p-1" data-toggle="dropdown" href="#" aria-haspopup="true" aria-expanded="false">Add</a>
													<div class="dropdown-menu">
													<form @submit.prevent='addTerms' class="px-2 py-0">
														<div class="row flex-nowrap mx-0">
															<div class="col px-0">
																<div class="form-group mb-0 mr-1">
																	<input type="text" v-model="addTermVar" class="form-control">
																</div>
															</div>
															<div class="col-auto px-0">
																<button type="submit" class="btn btn-success" value="Submit">Add term</button>
															</div>
														</div>
													</form>
												</div>
											</label>
											<div class="form-control flex-grow-1 h-100 py-2">
												<!-- Terms list {{{ -->
												<div class="mt-n1">

													<span v-for="(item, index) in river.terms" v-bind:key="item._id">
														 <!-- badge mb-0 mt-1 badge mb-0 mt-1 -->
														<a v-if="index < 5" class="badge mb-0 mt-1" v-bind:class="item.isActive ? 'btn-success' : 'badge-light text-muted'" v-on:click="addTags(item, index)" style="user-select: none;">
															{{item.term || '&nbsp;'}}
														</a>
													</span>
													<a v-if="river.terms.length >= 6" class="small text-decoration-none" data-toggle="modal" href="#modal-terms-list">
														+ {{river.terms.length - 5}} more {{river.terms.length - 5 === 1 ? 'keyword' : 'Keywords'}}
													</a>
													<small v-if="!river.terms || river.terms.length === 0">
														<i class="far fa-fw fa-sm fa-exclamation-triangle"></i>
														There are no defined Keywords for this river
													</small>
												</div>
												<!-- }}} -->
											</div>
										</div>
									</div>
									<div class="col flex-grow-1 px-2" style="flex-basis: 25%">
										<div class="form-group nowrap">
											<label  class="mb-1">Exchange</label>
											<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Choose the platform of the company or asset you want to view'"></i>
											<select class="custom-select">
												<option value="" selected>Bitfinex</option>
												<option value="" disabled>NYSE</option>
												<option value="" disabled>NASDAQ</option>
												<option value="" disabled>ASX</option>
											</select>
										</div>
										<div class="form-group mb-0">
											<label class="mb-1 text-nowrap">
												Symbol
												<i v-if="river.static" class="fas fa-fw fa-sm fa-info-circle text-secondary" v-tooltip.right="'Enter the stock or asset symbol your influencer is moving. example: BTCUSD for Bitcoin US Dollar value'"></i>
												<a class="mx-1 my-n1 p-1" data-toggle="dropdown" href="#" aria-haspopup="true" aria-expanded="false">Add</a>
												<div class="dropdown-menu dropdown-menu-right">
													<form @submit.prevent="" class="px-2 py-0">
														<div class="row flex-nowrap mx-0">
															<div class="col px-0">
																<div class="input-group flex-grow-1 pr-1 text-nowrap">
																	<div class="input-group-prepend">
																		<span class="input-group-text">
																			<i class="fa-fw far fa-at"></i>
																		</span>
																	</div>
																	<select class="custom-select" data-toggle="modal" data-target="#modal-restricted-feature" style="min-width:80px"></select>
																</div>
															</div>
															<div class="col-auto px-0">
																<!-- TODO: for demo modal to say it is an user feature + signup -->
																<!-- FIXME: inline way to edit and add to own river as an user -->
																<a class="btn btn-success" value="Submit" data-toggle="modal" data-target="#modal-restricted-feature">Add symbol</a>
															</div>
														</div>
													</form>
												</div>
											</label>
											<v-select
												class="form-control"
												:options="river.flows"
												:value="flow"
												label="symbol"
												:clearable="false"
												:searchable="false"
												@input="flow = $event"
											>
												<template #option="{ platform, symbol }">
													{{platform | startCase}}:{{symbol}}
												</template>
											</v-select>
										</div>
									</div>
								</div>
							</div>

							<!-- Passing through river as results may not always be within widget -->
							<rivers-view-results
								v-if="river && flow"
								:platformApiCall="$props.platformApiCall"
								:mode="$props.mode"
								:href="$props.href"
								:flow="flow"
								:river="river"
							/>

							<!-- DEMO: Tesla price + tweet annotation chart -->
							<div class="mt-5">
								<h4>Tesla Price + Tweet Annotations (Demo)</h4>
								<riversViewChartLine :flowData="teslaPrices" :streamsData="teslaTweets" />
							</div>

							<!-- Confirm delete -->
							<div class="modal" id="modal-delete-river">
								<div class="modal-dialog modal-dialog-centered shadow-none">
									<div class="modal-content shadow">
										<div class="modal-header align-items-center">
											<h4 class="mb-0">
												Delete this river
											</h4>
											<button type="button" class="close m-0 px-2 py-1" data-dismiss="modal" aria-label="Close">
												<span aria-hidden="true">
													<i class="fal fa-lg fa-times"></i>
												</span>
											</button>
										</div>
										<div class="modal-body">
											<p>You are about to delete this river ({{river.title}}).</p>
											<p>Please click "Delete" button below to confirm — this action will not be reversible.</p>
										</div>
										<div class="modal-footer">
											<button class="btn btn-light" data-dismiss="modal">Cancel</button>
											<button class="btn btn-danger" data-dismiss="modal" @click="remove()">Delete</button>
										</div>
									</div>
								</div>
							</div>

							<!-- Notification setting -->
							<div class="modal" id="modal-notifications">
								<div class="modal-dialog modal-dialog-centered shadow-none">
									<div class="modal-content shadow">
										<div class="modal-header align-items-center">
											<h4 class="mb-0 text-truncate">
												Notification settings
											</h4>
											<button type="button" class="close m-0 px-2 py-1" data-dismiss="modal" aria-label="Close">
												<span aria-hidden="true">
													<i class="fal fa-lg fa-times"></i>
												</span>
											</button>
										</div>
										<div class="modal-body">
											<!-- FIXME: check over/refactor logic -->
											<!-- If river can be edited by logged in user (own or global) -->
											<div class="form-group" v-if="$session && ($session.hasPermission('riversGlobalCreate') || !river.global)">
												<!-- TODO: disable check input if global -->
												<div class="custom-control custom-switch">
													<input type="checkbox" id="notificationToggle" class="custom-control-input" v-model="river.notifications" @click="switchNotifications()">
													<label for="notificationToggle" class="custom-control-label">Notify when a term matches</label>
												</div>
											</div>
											<!-- If river can not be edited by logged in user (generally viewing from "home" user dashboard) -->
											<div v-else-if="river.global && $session.isLoggedIn">
												Sorry, you can't adjust notification settings for this River. Please make a copy of this River and edit this from your Rivers.
											</div>
											<!-- Else, not logged-in (must be on promo page) -->
											<div v-else>
												<p>Receive an alert when your influencer makes a post matching your search criteria.</p>
												<a class="btn btn-primary" href="/signup">Create an account</a>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Full terms list -->
							<div class="modal" id="modal-terms-list">
								<div class="modal-dialog modal-dialog-centered shadow-none">
									<div class="modal-content shadow">
										<div class="modal-header align-items-center">
											<h4 class="mb-0 text-truncate">
												Keywords
											</h4>
											<button type="button" class="close m-0 px-2 py-1" data-dismiss="modal" aria-label="Close">
												<span aria-hidden="true">
													<i class="fal fa-lg fa-times"></i>
												</span>
											</button>
										</div>
										<div class="modal-body">
											<div class="h5 mb-0">
												<span v-for="(item, index) in river.terms" v-bind:key="item._id">
													<!-- badge mb-0 mt-1 badge mb-0 mt-1 -->
													<a v-if="index < 5" class="badge mb-0 mt-1" v-bind:class="item.isActive ? 'btn-success' : 'badge-light text-muted'" v-on:click="addTags(item, index)" style="user-select: none;">
														{{item.term || '&nbsp;'}}
													</a>
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Restricted feature notice -->
							<div class="modal" id="modal-restricted-feature">
								<div class="modal-dialog modal-dialog-centered shadow-none">
									<div class="modal-content shadow">
										<div class="modal-header align-items-center">
											<h4 class="mb-0 text-truncate">
												You've discovered an advanced feature
											</h4>
											<button type="button" class="close m-0 px-2 py-1" data-dismiss="modal" aria-label="Close">
												<span aria-hidden="true">
													<i class="fal fa-lg fa-times"></i>
												</span>
											</button>
										</div>
										<div class="modal-body">
											<p>
												This feature is only available to registered users.
											</p>
											<p>
												To access this feature and tons more, please create an account.
											</p>
											<a class="btn btn-primary" href="/signup">Create an account</a>
										</div>
									</div>
								</div>
							</div>

						</div>
						<!-- }}} -->

					</div>
					<!-- }}} -->
				</div>
			</div>
		</div>
	</main>
</template>

<style>
	.widget {
		display: flex;
		flex-direction: row;
		height: 100%;

		@media (max-width: 991px) {
			flex-direction: column;
		}
	}

	.widget__sidebar {
		overflow: auto;
		width: 15rem;
		flex: 0 0 auto;

		@media (max-width: 991px) {
			width: 100%;
		}
	}

	.widget__content {
		flex-basis: 0;
		flex-grow: 1;
		height: 100%;
		max-width: 100%;
		overflow-y: scroll;
	}

	.form-control .vs__selected-options > input {
		text-transform: uppercase;
		min-width: 80px;
	}
</style>