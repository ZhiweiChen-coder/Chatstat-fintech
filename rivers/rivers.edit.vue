<script lang="js" frontend>
app.component({
	route: '/rivers/edit/:id',
	data() { return {
		river: undefined,
		form: {
			term: '',
			stream: {
				platform: 'twitter',
				symbol: '',
				options: [],
			},
			// TODO: flows, in order to edit existing entries while providing a dropdown
			flow: {
				platform: 'bitfinex',
				//market: '',
				symbol: '',
				options: [],
			},
			error: {
				term: '',
				stream: '',
				flow: '',
			},
		},
	}},
	methods: {
	// checkForm: function (e) {
	// 	if(this.river.streams.length == 0) this.form.error.stream = "No Streams has been selected"
	// 	if(this.river.flows.length == 0) this.form.error.flow = "No Flow has been selected"
	// 	e.preventDefault();
    // },
		/**
		 * Retrieve river data for editing
		 * @returns {Promise} Resolves when API request is complete
		 */
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> (this.$route.params.id === 'new') ? { data: {
					flows: [],
					streams: [],
					terms: [],
					users: [
						{ user: this.$session.data._id }
					],
				}} : this.$http.get(`/api/rivers/${this.$route.params.id}`))
				.then(({data}) => this.river = data)
				.then(()=> this.$sitemap.setBreadcrumbs([
					{title: 'Charts', href: '/rivers'},
					(this.$route.params.id === 'new') ? {title: 'New', href: '/rivers/edit/new'} : {title: this.river.title, href: `/rivers/${this.river._id}/edit`},
				])).then(() => {

					Promise.resolve()
						.then(() => this.$http.get(`/api/platforms/${this.form.flow.platform}/suggest`, { params: {
							symbol: "",
						}}))
						// NOTE: We pass in the whole object so that $set can be used here on the array
						.then(({data}) => this.$set(this.form.flow, 'options', data))
				})

				// form.flow.options
				// form.flow
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},

		/**
		 * Save river data to database
		 * @returns {Promise} Resolves when API request is complete
		 */
		save(notification = false, redirect = true) {
			if(this.river.streams.length == 0) this.form.error.stream = "No Streams has been selected";
			else this.form.error.stream = "";
			if(this.river.flows.length == 0) this.form.error.flow = "No Flow has been selected";
			else this.form.error.flow = "";
			if(this.river.streams.length == 0 || this.river.flows.length == 0) e.preventDefault();
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$route.params.id === 'new' ? this.$http.post('/api/rivers', this.river) : this.$http.post(`/api/rivers/${this.$route.params.id}`, this.river))
				.then(({data}) => this.river = data)
				.then(()=> notification && this.$toast.success('Saved'))
				.then(()=> redirect && this.$router.push('/rivers/' + this.river._id))
				.then(()=> !redirect && this.$route.params.id === 'new' && this.$router.push('/rivers/' + this.river._id))
				.then(()=> this.$sitemap.setBreadcrumbs([
					{title: 'Charts', href: '/rivers'},
					{title: this.river.title, href: `/rivers/${this.river._id}/edit`},
				]))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},

		/**
		* Triggered when the search text changes.
		*
		* @param {Object} target Pointer to key within form
		* @param {String} search Current symbol search text
		* @param {Function} loading Toggle loading class
		*/
		suggestSymbol(target, search, loading) {
			console.log(target)
			console.log(search)
			console.log(loading)
			if (!target || !target.platform) return;
			Promise.resolve()
				.then(() => loading(true))
				.then(() => this.$http.get(`/api/platforms/${target.platform}/suggest`, { params: {
					symbol: search,
				}}))
				// NOTE: We pass in the whole object so that $set can be used here on the array
				.then(({data}) => this.$set(target, 'options', data))
				.finally(() => loading(false));
		},

		/**
		 * Create a new stream and add it to the river after checking symbol is valid
		 * @returns {Promise} Resolves when API request is complete
		 */
		addStream() {
			if (!this.form.stream.platform || !this.form.stream.symbol) return Promise.reject();

			let item = {
				//id: 'FIXME',
				platform: this.form.stream.platform,
				symbol: this.form.stream.symbol
			};

			return Promise.resolve()
				// Validation
				.then(() => (
					this.river.streams.some(s => s.platform === this.form.stream.platform && s.symbol.toLowerCase() === this.form.stream.symbol.toLowerCase())) ?
						Promise.reject(`There is already a stream: '${this.form.stream.symbol}' added in the list.`) : Promise.resolve()
				)
				// Check symbol exists on platform
				.then(() => this.$http.get(`/api/platforms/${item.platform}/exists?symbol=${item.symbol}`)
					.then(({data}) => {
						if (!data || !data.symbol) return Promise.reject(`Platform (${item.platform}) does not support given symbol (${item.symbol}).`)

						this.$debug('Found', data.symbol);
						item.symbol = data.symbol;
					})

				)
				.then(() => {
					// TODO: Perhaps reset to blank? Or first option?
					this.form.stream.symbol = '';
					this.river.streams.push(item);
				})
				.catch(e => this.form.error.stream = e.err || e);
		},

		/**
		 * Remove stream from river
		 * @param {number} index Position to remove from list
		 */
		removeStream(index) {
			this.$delete(this.river.streams, index);
		},

		/**
		 * Create a new term and add it to the river
		 */
		addTerm() {
			if (!this.form.term) return;
			if (this.river.terms.some(term => term.term === this.form.term)) {
				return this.form.error.term = `There is already the term: '${this.form.term}' added in the list.`;
			}
			let item = {
				//id: 'FIXME',
				term: this.form.term,
			};
			this.form.term = '';
			this.river.terms.push(item);
		},

		/**
		 * Remove term from river
		 * @param {number} index Position to remove from list
		 */
		removeTerm(index) {
			this.$delete(this.river.terms, index);
		},

		/**
		 * Create a new flow and add it to the river
		 */
		addFlow() {
			if (!this.form.flow.platform || !this.form.flow.symbol) return;
			if (this.river.flows.some(flow => flow.platform === this.form.flow.platform && flow.symbol === this.form.flow.symbol)) {
				return this.form.error.flow = `There is already a flow: '${this.form.flow.symbol.toUpperCase()}' added in the list.`;
			}
			let item = {
				//id: 'FIXME',
				platform: this.form.flow.platform,
				//market: this.form.flow?.market,
				symbol: this.form.flow.symbol
			};
			// TODO: Perhaps reset to blank? Or first option?
			this.form.flow.market = '';
			this.form.flow.symbol = '';
			this.river.flows.push(item);
		},

		/**
		 * Remove flow from river
		 * @param {number} index Position to remove from list
		 */
		removeFlow(index) {
			this.$delete(this.river.flows, index);
		},

		/**
		 * Takes an event from type="datetime-local" and converts to date object
		 *
		 * @param {object} Change event
		 */
		updateStaticDate(e) {
			this.river.now = moment(e.target.value, 'YYYY-MM-DDTHH:MM').utc().toDate();
		},
	},
	created() {
		this.$debug.enable(false);
		this.refresh();
	}
});
</script>

<template>
	<form class="py-3" v-if="river" @submit.prevent="save()">
		<div class="card shadow-sm">
			<div class="card-body">

				<!-- River basics {{{ -->
				<fieldset>
					<div class="form-group">
						<label class="col-form-label">Title</label>
						<input v-model="river.title" type="text" class="form-control" required>
					</div>
				</fieldset>
				<!-- }}} -->
				<!-- Data streams {{{ -->
				<fieldset class="mt-4">
					<div class="form-group">
						<label class="col-form-label">Data streams</label>
						<ul class="list-group list-group-flush mt-n1">
							<li class="list-group-item px-0 py-2" v-show="!river.streams.length">
								<div class="alert alert-secondary mb-0">
									<small class="text-danger">There are no data streams added to this river yet.</small>
								</div>
							</li>
							<li class="list-group-item px-0 py-2" v-for="(stream, index) in river.streams" :key="stream._id">
								<div class="d-flex mx-n1">
									<div class="input-group flex-grow-1 mx-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fa-fw" v-bind:class="{
													'fab fa-twitter': stream.platform === 'twitter',
													'fab fa-facebook-f': stream.platform === 'facebook',
													'fas fa-rss': stream.platform === 'rss'
												}"></i>
											</span>
										</div>
										<select class="form-control" v-model="stream.platform" disabled>
											<option value="twitter">Twitter</option>
											<option value="facebook">Facebook</option>
											<option value="rss">RSS</option>
										</select>
									</div>
									<div class="input-group flex-grow-1 mx-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fa-fw" v-bind:class="{'far fa-at': stream.platform === 'twitter' || stream.platform === 'facebook', 'far fa-link': stream.platform === 'rss'}"></i>
											</span>
										</div>
										<input class="form-control" v-model="stream.symbol" type="text" :placeholder="stream.platform === 'twitter' || stream.platform === 'facebook' ? 'Handle' : 'Link'" disabled>
									</div>
									<button type="button" class="btn btn-outline-danger mx-1" v-on:click="removeStream(index)" style="right: -36px">
										<i class="far fa-times"></i>
									</button>
								</div>
							</li>
							<li class="list-group-item px-0 py-2">
								<div class="d-flex mx-n1">
									<div class="input-group flex-grow-1 mx-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fa-fw" v-bind:class="{'fab fa-twitter': form.stream.platform === 'twitter', 'fab fa-facebook-f': form.stream.platform === 'facebook', 'fas fa-rss': form.stream.platform === 'rss'}"></i>
											</span>
										</div>
										<!-- TODO: Pull options from schema enumValues -->
										<select class="form-control" v-model="form.stream.platform">
											<option value="twitter">Twitter</option>
											<option value="facebook">Facebook</option>
											<option value="rss">RSS</option>
										</select>
									</div>
									<div class="input-group flex-grow-1 mx-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="fa-fw" v-bind:class="{'far fa-at': form.stream.platform === 'twitter' || form.stream.platform === 'facebook', 'far fa-link': form.stream.platform === 'rss'}"></i>
											</span>
										</div>
										<input
											class="form-control"
											v-model="form.stream.symbol"
											type="text"
											@keydown.enter.prevent="addStream"
											:disabled="!form.stream.platform"
											:placeholder="form.stream.platform === 'twitter' || form.stream.platform === 'facebook' ? 'Handle' : 'Link'"
										>
									</div>
									<button
										class="btn btn-light text-nowrap mx-1"
										v-on:click="addStream"
										type="button"
										:disabled="!form.stream.platform || !form.stream.symbol"
									>Add stream</button>
								</div>
								<small v-if="form.error.stream" class="form-text text-danger alert alert-danger" role="alert">{{form.error.stream}}</small>
							</li>
						</ul>
					</div>
				</fieldset>
				<!-- }}} -->
				<!-- Terms {{{ -->
				<fieldset class="mt-4">
					<div class="form-group">
						<label class="col-form-label">Keywords</label>
						<div class="border border-default rounded p-2" v-bind:class="{'h5': river.terms.length > 0}">
							<span class="badge badge-info m-1" v-for="(term, index) in river.terms" :key="term._id">
								<span v-editable="v => term.term = v">{{term.term}}</span>
								<a class="text-white px-1" v-on:click="removeTerm(index)">
									<i class="far fa-times"></i>
								</a>
							</span>
							<small class="text-muted m-1" v-if="!river.terms.length > 0">No Keywords added yet.</small>
						</div>
					</div>
					<div class="d-flex">
						<input class="form-control flex-grow-1 mr-2" v-model="form.term" @keydown.enter.prevent="addTerm" @change="form.error.term = ''" type="text" placeholder="Term keyword">
						<button
							class="btn btn-light text-nowrap"
							v-on:click="addTerm"
							type="button"
							:disabled="!form.term"
						>Add term</button>
					</div>
					<small v-if="form.error.term" class="form-text text-danger alert alert-danger" role="alert">{{form.error.term}}</small>
				</fieldset>
				<!-- }}} -->
				<!-- Flows {{{ -->
				<fieldset class="mt-4">
					<div class="form-group">
						<label class="col-form-label">Flows</label>
						<ul class="list-group list-group-flush mt-n1">
							<li class="list-group-item px-0 py-2" v-show="!river.flows.length">
								<div class="alert alert-secondary mb-0">
									<small class="text-danger">There are no flows added to this river yet.</small>
								</div>
							</li>
							<li class="list-group-item px-0 py-2" v-for="(flow, index) in river.flows" :key="flow._id">
								<div class="d-flex mx-n1">
									<div class="input-group flex-grow-1 mb-0 px-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-coins"></i>
											</span>
										</div>
										<!-- TODO: Pull options from schema enumValues -->
										<!-- TODO: Perhaps this is static once added and only symbol can be modified? -->
										<select v-model="flow.platform" class="form-control" disabled>
											<option value="bitfinex">Bitfinex</option>
										</select>
									</div>
									<!--
									// This approach may make more sense if streams takes a similar angle
									// Will revisit after establishing some agents to pull data using the Platform/Symbol semantics.

									<div class="input-group flex-grow-1 mb-0 px-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-coins"></i>
											</span>
										</div>
										<select v-model="flow.platform" class="form-control" name="" id="">
											<option value="stock">Stock</option>
											<option value="crypto">Cryptocurrency</option>
										</select>
									</div>

									<div class="input-group flex-grow-1 mb-0 px-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-landmark"></i>
											</span>
										</div>
										<select v-model="flow.market" class="form-control" name="" id="" :disabled="flow.platform == 'crypto'">
											<option value="nyse">NYSE</option>
											<option value="nasdaq">NASDAQ</option>
											<option value="asx">ASX</option>
										</select>
									</div>
									-->
									<div class="input-group flex-grow-1 mb-0 px-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-dollar-sign"></i>
											</span>
										</div>
										<input v-model="flow.symbol" class="form-control text-uppercase" type="text" disabled>
									</div>
									<button type="button" class="btn btn-outline-danger mx-1" v-on:click="removeFlow(index)" style="right: -36px">
										<i class="far fa-times"></i>
									</button>
								</div>
							</li>
							<li class="list-group-item px-0 py-2">
								<div class="d-flex d-flex mx-n1">
									<div class="input-group flex-grow-1 mb-0 px-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-coins"></i>
											</span>
										</div>
										<!-- TODO: Pull options from schema enumValues -->
										<select v-model="form.flow.platform" class="form-control">
											<option value="bitfinex">Bitfinex</option>
										</select>
									</div>

									<!--
									<div class="input-group flex-grow-1 mb-0 mr-2">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-coins"></i>
											</span>
										</div>
										<select v-model="form.flow.platform" class="form-control" name="" id="">
											<option value="stock">Stock</option>
											<option value="crypto">Cryptocurrency</option>
										</select>
									</div>
									<div class="input-group flex-grow-1 mb-0 mr-2">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-landmark"></i>
											</span>
										</div>
										<select v-model="form.flow.market" class="form-control" name="" id="" :disabled="form.flow.platform === 'crypto'">
											<option value="nyse">NYSE</option>
											<option value="nasdaq">NASDAQ</option>
											<option value="asx">ASX</option>
										</select>
									</div>
									-->

									<div class="input-group flex-grow-1 mb-0 mx-1">
										<div class="input-group-prepend">
											<span class="input-group-text">
												<i class="far fa-fw fa-dollar-sign"></i>
											</span>
										</div>
										<v-select
											class="form-control"
											:disabled="!form.flow.platform"
											:clearable="false"
											:options="form.flow.options"
											@keydown.enter.prevent="addFlow"
											v-model="form.flow.symbol"
											@search="(search, loading) => suggestSymbol(form.flow, search, loading)"
										/>
									</div>
									<button
										class="btn btn-light text-nowrap mx-1"
										v-on:click="addFlow"
										type="button"
										:disabled="!form.flow.platform || !form.flow.symbol"
									>Add flow</button>
								</div>
								<small v-if="form.error.flow" class="form-text text-danger alert alert-danger" role="alert">{{form.error.flow}}</small>
							</li>
						</ul>
					</div>
				</fieldset>
				<!-- }}} -->
				<!-- Other settings {{{ -->
				<fieldset class="mt-4">
					<div class="form-group">
						<div class="custom-control custom-switch">
							<input v-model="river.notifications" type="checkbox" class="custom-control-input" id="isNotifiedOnMatch">
							<label class="custom-control-label" for="isNotifiedOnMatch">Notify when a term matches</label>
						</div>
						<div class="custom-control custom-switch" v-if="$session.hasPermission('riversGlobalCreate')">
							<input type="checkbox" class="custom-control-input" id="isGlobal" v-model="river.global">
							<label class="custom-control-label" for="isGlobal">Global River</label>
						</div>
						<div class="custom-control custom-switch" v-if="$session.hasPermission('riversStaticCreate')">
							<input type="checkbox" class="custom-control-input" id="isStatic" v-model="river.static">
							<label class="custom-control-label" for="isStatic">Static River</label>
						</div>
						<div v-if="$session.hasPermission('riversStaticCreate') && river.static">
							<input type="datetime-local" id="staticDate" :value="river.now | date({
								format: 'YYYY-MM-DDTHH:MM'
							})" @change="updateStaticDate">
							<label for="staticDate">Static "now" Date</label>
						</div>
					</div>
				</fieldset>
				<!-- }}} -->
				<!-- CTA {{{ -->
				<div class="mt-4 text-right mx-n1">
					<a v-href="'/rivers'" class="btn btn-light mx-1" v-tooltip="'Discard changes to this river'">
						<i class="far fa-times"></i> Cancel
					</a>
					<button type="submit" class="btn btn-success mx-1" v-tooltip="'Save changes to river'">
						<i class="far fa-check"></i> Save
					</button>
				</div>
				<!-- }}} -->
			</div>
		</div>
	</form>
</template>

<style lang="scss">
	.form-control .vs__selected-options > input {
		text-transform: uppercase;
	}
</style>