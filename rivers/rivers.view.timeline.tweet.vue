<script lang="js" frontend>
// in milliseconds
const HOURS_3 = 10800000;
const HOURS_12 = 43200000;
const HOURS_24 = 86400000;

app.component('riversViewTimelineTweet', {
	data() { return {
		HOURS_3,
		HOURS_12,
		HOURS_24,
		movement: undefined,
		movementLoading: true,
	}},
	props: {
		platform: {type: String},
		symbol: {type: String},
		tweet: {type: Object, required: true},
	},
	methods: {
		/**
		 * Load tweet display analysis
		 * @returns {Promise} A promise which resolves when the operation has completed
		 */
		refresh() {
			// Possible to show a tweet without knowing the selected "flow", thus having no "movement" context
			if (!this.platform || !this.symbol) return;
			return Promise.resolve()
				.then(()=> this.movementLoading = true)
				.then(()=> this.$http.get(`/api/timeline/${this.platform}/${this.symbol}/${this.tweet._id}`)
					.then(({data}) => this.movement = data)
					.catch(e => {
						if (_.isEqual(e, {err: "Not enough data"})) {
							this.movement = {
								hour0: {estimateCalculated: false},
								hour3: {estimateCalculated: false},
								hour12: {estimateCalculated: false},
								hour24: {estimateCalculated: false},
							};

						} else {
							throw e;
						}
					})
				)
				.catch(this.$toast.catch)
				.then(() => console.log(this.tweet))
				.finally(()=> this.movementLoading = false)
		},

		/**
		 * Send a test notification relating to this tweet
		 * @param {string} tweet The ID of tweet to send
		 * @returns {Promise} A promise which resolves when the operation has completed
		 */
		/*
		// LEGACY: Only required for testing? Without it we can get by without river.
		sendNotification(tweet){
			if (!this.river.notifications) return;
			if (this.river.static) return;

			return this.$http.get(`/api/notify/${this.river._id}/${tweet}`)
				.then((res) => this.$toast.success('Notification dispatched'))
				.catch(this.$toast.catch)
		},
		*/
	},
	created() {
		this.$debug.enable(true);

		this.$watchAll(['platform', 'symbol', 'tweet'], () => {
			this.$debug('$watchAll', this.platform, this.symbol, this.tweet);
			this.refresh();
		}, {immediate: true, deep: false});
	},
});
</script>

<template>
	<div v-if="tweet">
		 <div class="card">
			<div class="card-body">
				<!-- Event contents {{{ -->
				<section>
					<small class="mx-n1">
						<span class="mx-1">
							<i class="fab fa-twitter"></i> Twitter
						</span>
						<!-- Datetime -->
						<span class="text-muted mx-1">{{tweet.date | date({ utc: true })}} GMT</span>
						<!-- Location -->
						<span v-if="tweet.data.geo" class="text-muted mx-1">{{tweet.data.geo}}</span>
					</small>
					<div class="mt-2 mx-n1">
						<!-- TODO: Haven't stored user's title from Twitter API -->
						<span class="h5 mx-1">{{tweet.data.author_name}}</span>
						<span class="text-muted mx-1">@{{tweet.symbol}}</span>
					</div>
					<p class="lead mt-1" v-html="tweet.data.text"></p>
						<small class="d-block mt-1 mx-n1">
							<span class="text-muted text-nowrap mx-1">
								<i class="far fa-comment"></i>
								{{tweet.data.public_metrics.reply_count | number}} replies
							</span>
							<span class="text-muted text-nowrap mx-1">
								<i class="far fa-retweet"></i>
								{{tweet.data.public_metrics.retweet_count | number}} retweets
							</span>
							<span class="text-muted text-nowrap mx-1">
								<i class="far fa-heart"></i>
								{{tweet.data.public_metrics.like_count | number}} likes
							</span>
						</small>
				</section>
				<!-- }}} -->
				<hr size="0">
				<!-- Event analysis {{{ -->
				<section v-if="movement">
					<!-- Known price change {{{ -->
					<!--
						It has been over 24 hours since Event (i.e. Tweet post) datetime. We should now show a breakdown of price change (3h, 12h and 24h). Using date comparison as can't seem to be able to rely on the movement.hour24.actualCalculated value
					-->
					<div class="card-group mb-2" v-if="(Date.now() - HOURS_24 - Date.parse(tweet.date)) > 0">
						<div class="card h-100 m-0">
							<div class="card-body py-2">
								<small class="d-flex align-items-baseline mx-n1">
									<span class="mx-1">3h</span>
									<span class="text-muted mx-1" v-if="movement.hour3.date">{{movement.hour3.date | date({ utc: true })}}</span>
									<button class="btn btn-sm btn-link px-1 py-0" v-tooltip="`Past analysis: ${movement.hour3.estimate > 0 ? '+' : ''}${movement.hour3.estimate ? (movement.hour3.estimate).toFixed(2) : 'n/a'} (${movement.hour3.estimatePercent ? (movement.hour3.estimatePercent * 100).toFixed(2) + '%' : 'no&nbsp;data&nbsp;yet'})`">
										<i class="far fa-history"></i>
									</button>
								</small>
								<div v-if="movement.hour3.actual" :class="movement.hour3.actual < 0 ? 'text-warning' : 'text-success'">
									<i class="fas mb-0" :class="movement.hour3.actual >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
									{{movement.hour3.actual | currency}}
									({{movement.hour3.actualPercent * 100 | percent({precision: 2})}})
								</div>
								<div v-else class="text-muted">
									<i class="far fa-sm fa-exclamation-triangle"></i>
									Problem fetching data
								</div>
							</div>
						</div>
						<div class="card h-100 m-0">
							<div class="card-body py-2">
								<small class="d-flex align-items-baseline mx-n1">
									<span class="mx-1">12h</span>
									<span class="text-muted mx-1" v-if="movement.hour12.date">{{movement.hour12.date | date({ utc: true })}}</span>
									<button class="btn btn-sm btn-link px-1 py-0" v-tooltip="`Past analysis: ${movement.hour12.estimate > 0 ? '+' : ''}${movement.hour12.estimate ? (movement.hour12.estimate).toFixed(2) : 'n/a'} (${movement.hour12.estimatePercent ? (movement.hour12.estimatePercent * 100).toFixed(2) + '%' : 'no&nbsp;data&nbsp;yet'})`">
										<i class="far fa-history"></i>
									</button>
								</small>
								<div v-if="movement.hour12.actual" :class="movement.hour12.actual < 0 ? 'text-warning' : 'text-success'">
									<i class="fas mb-0" :class="movement.hour12.actual >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
									{{movement.hour12.actual | currency}}
									({{movement.hour12.actualPercent * 100 | percent({precision: 2})}})
								</div>
								<div v-else class="text-muted">
									<i class="far fa-sm fa-exclamation-triangle"></i>
									Problem fetching data
								</div>
							</div>
						</div>
						<div class="card h-100 m-0">
							<div class="card-body py-2">
								<small class="d-flex align-items-baseline mx-n1">
									<span class="mx-1">24h</span>
									<span class="text-muted mx-1" v-if="movement.hour24.date">{{movement.hour24.date | date({ utc: true })}}</span>
									<button class="btn btn-sm btn-link px-1 py-0" v-tooltip="`Past analysis: ${movement.hour24.estimate > 0 ? '+' : ''}${movement.hour24.estimate ? (movement.hour24.estimate).toFixed(2) : 'n/a'} (${movement.hour24.estimatePercent ? (movement.hour24.estimatePercent * 100).toFixed(2) + '%' : 'no&nbsp;data&nbsp;yet'})`">
										<i class="far fa-history"></i>
									</button>
								</small>
								<div v-if="movement.hour24.actual" :class="movement.hour24.actual < 0 ? 'text-warning' : 'text-success'">
									<i class="fas mb-0" :class="movement.hour24.actual >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
									{{movement.hour24.actual | currency}}
									({{movement.hour24.actualPercent * 100 | percent({precision: 2})}})
								</div>
								<div v-else class="text-muted">
									<i class="far fa-sm fa-exclamation-triangle"></i>
									Problem fetching data
								</div>
							</div>
						</div>
					</div>
					<!-- }}} -->
					<!-- Else give a prediction {{{ -->
					<div class="mb-2" v-else>
						<div class="d-flex align-items-baseline mb-1">
							<div class="mr-2">
								<span v-if="(Date.now() - HOURS_3 - Date.parse(tweet.date)) < 0">3h</span>
								<span v-else-if="(Date.now() - HOURS_12 - Date.parse(tweet.date)) < 0">12h</span>
								<span v-else>24h</span>
							</div>
							<small class="text-muted">
								<span v-if="(Date.now() - HOURS_3 - Date.parse(tweet.date)) < 0">
									{{movement.hour3.date | date({ utc: true })}}
								</span>
								<span v-else-if="(Date.now() - HOURS_12 - Date.parse(tweet.date)) < 0">
									{{movement.hour12.date | date({ utc: true })}}
								</span>
								<span v-else>
									{{movement.hour24.date | date({ utc: true })}}
								</span>
							</small>
							<button v-if="tweet.sentiment" class="btn btn-link ml-auto px-1 py-0" data-toggle="modal" :data-target="`#analysis-info-modal-${this.tweet.platform}-${this.tweet.symbol}-${this.tweet._id}`" type="button">
								<span class="far fa-question-circle"></span>
							</button>
						</div>
						<div class="card-group">
							<div class="card h-100 m-0">
								<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
									<i class="h2 fas mb-0" v-if="(Date.now() - HOURS_3 - Date.parse(tweet.date)) < 0" :class="movement.hour3.estimate < 0 ? 'text-warning fa-caret-down' : 'text-success fa-caret-up'"></i>
									<i class="h2 fas mb-0" v-else-if="(Date.now() - HOURS_12 - Date.parse(tweet.date)) < 0" :class="movement.hour12.estimate < 0 ? 'text-warning fa-caret-down' : 'text-success fa-caret-up'"></i>
									<i class="h2 fas mb-0" v-else :class="movement.hour24.estimate < 0 ? 'text-warning fa-caret-down' : 'text-success fa-caret-up'"></i>
								</div>
							</div>
							<div class="card h-100 m-0">
								<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
									<span v-if="(Date.now() - HOURS_3 - Date.parse(tweet.date)) < 0" :class="movement.hour3.actual < 0 ? 'text-warning' : 'text-success'">
										{{movement.hour3.estimate < 0 ? '-' : '+'}}
										{{movement.hour3.estimate | currency}}
										({{movement.hour3.estimatePercent * 100 | percent}})
									</span>
									<span v-else-if="(Date.now() - HOURS_12 - Date.parse(tweet.date)) < 0" :class="movement.hour12.actual < 0 ? 'text-warning' : 'text-success'">
										{{movement.hour12.estimate < 0 ? '-' : '+'}}
										{{movement.hour12.estimate | currency}}
										({{movement.hour12.estimatePercent * 100 | percent}})
									</span>
									<span v-else :class="movement.hour24.actual < 0 ? 'text-warning' : 'text-success'">
										{{movement.hour24.estimate < 0 ? '-' : '+'}}
										{{movement.hour24.estimate | currency}}
										({{movement.hour24.estimatePercent * 100 | percent}})
									</span>
								</div>
							</div>
							<div class="card h-100 m-0">
								<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
									<div class="cs-gauge" :class="{'is-empty': !tweet.sentiment}">
										<div class="cs-gauge-pointer" :style="{'transform': `rotate(${(tweet.sentiment.affinPercent || 0) * 90}deg)`}"></div>
									</div>
								</div>
							</div>
							<!-- FIXME: assurity value
							<div class="card h-100 m-0">
								<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
									<div class="badge badge-pill badge-warning m-0">
										23% assurity
									</div>
								</div>
							</div>
							-->
						</div>
					</div>
					<!-- }}} -->
				</section>
				<!-- }}} -->
				<!-- {{{ -->
				<section class="row mb-1">
					<div v-if="movement && (Date.now() - HOURS_24 - Date.parse(tweet.date)) < 0" class="col text-left">
						<button class="btn btn-link p-0" data-toggle="modal" :data-target="`#breakdown-modal-${tweet.platform}-${tweet.symbol}-${tweet._id}`" type="button">View breakdown</button>
					</div>
					<div v-if="tweet.sentiment" class="col text-right">
						<button class="btn btn-link p-0" data-toggle="modal" :data-target="`#sentiment-modal-${tweet.platform}-${tweet.symbol}-${tweet._id}`" type="button">Sentiment analysis</button>
					</div>
				</section>
				<!-- }}} -->
			</div>
		</div>
		<!-- Analysis info modal {{{ -->
		<div class="modal" :id="`analysis-info-modal-${tweet.platform}-${tweet.symbol}-${tweet._id}`">
			<div class="modal-dialog modal-dialog-centered shadow-none">
				<div v-if="tweet.sentiment" class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Analysis infomation</h5>
						<button class="close" data-dismiss="modal" aria-label="Close">
							<i class="far fa-times"></i>
						</button>
					</div>
					<div class="modal-body">
						<div class="row">
							<div class="col-4">
								<div class="card h-100 m-0">
									<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
										<!-- FIXME -->
										<i class="h2 fas mb-0" :class="true ? 'text-success fa-caret-up' : 'text-warning fa-caret-down'"></i>
									</div>
								</div>
							</div>
							<div class="col">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
							</div>
						</div>
						<div class="row mt-2">
							<div class="col-4">
								<div class="card h-100 m-0">
									<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
										<!-- FIXME: prediction, plus/minus, switch text color for pos/neg -->
										<span class="text-center" :class="true ? 'text-success' : 'text-warning'">+$1.23 (0.45%)</span>
									</div>
								</div>
							</div>
							<div class="col">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
							</div>
						</div>
						<div class="row mt-2">
							<div class="col-4">
								<div class="card h-100 m-0">
									<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
										<div class="cs-gauge" :class="{'is-empty': !tweet.sentiment}">
											<div class="cs-gauge-pointer" :style="{'transform': `rotate(${(tweet.sentiment.affinPercent || 0) * 90}deg)`}"></div>
										</div>
									</div>
								</div>
							</div>
							<div class="col">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
							</div>
						</div>
						<!-- FIXME: assurity value
						<div class="row mt-2">
							<div class="col-4">
								<div class="card h-100 m-0">
									<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
										<div class="badge badge-pill badge-warning m-0">
											23% assurity
										</div>
									</div>
								</div>
							</div>
							<div class="col">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
							</div>
						</div>
						-->
					</div>
					<div class="modal-footer">
						<button class="btn btn-light ml-auto" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->
		<!-- Breakdown modal {{{ -->
		<div class="modal" :id="`breakdown-modal-${tweet.platform}-${tweet.symbol}-${tweet._id}`">
			<div class="modal-dialog modal-dialog-centered shadow-none">
				<div class="modal-content">
					<div class="modal-body py-0">
						<div class="my-3">
							<small>Change since event</small>
							<div :class="false ? 'text-success' : 'text-warning'">
								<i class="fas mb-0" :class="false ? 'fa-caret-up' : 'fa-caret-down'"></i>
								$1.23 (0.45%)
							</div>
						</div>
						<hr class="my-3" size="0">
						<div class="my-3" v-for="(delta, key) in movement" :key="key">
							<div v-if="key !== 'hour0'">
								<small class="d-flex align-items-baseline mx-n1">
									<span class="mx-1">
										<span v-if="key === 'hour3'">3h</span>
										<span v-else-if="key === 'hour12'">12h</span>
										<span v-else-if="key === 'hour24'">24h</span>
									</span>
									<span v-if="delta.date" class="text-muted mx-1">{{delta.date | date({ utc: true })}}</span>
									<button class="btn btn-sm btn-link px-1 py-0" v-tooltip="`Past analysis: ${delta.estimate > 0 ? '+' : ''}${delta.estimate ? (delta.estimate).toFixed(2) : 'n/a'} (${delta.estimatePercent ? (delta.estimatePercent * 100).toFixed(2) + '%' : 'no&nbsp;data&nbsp;yet'})`">
										<i class="far fa-history"></i>
									</button>
								</small>
								<div v-if="(key === 'hour3' && (Date.now() - HOURS_3 - Date.parse(tweet.date)) > 0) || (key === 'hour12' && (Date.now() - HOURS_12 - Date.parse(tweet.date)) > 0) || (key === 'hour24' && (Date.now() - HOURS_24 - Date.parse(tweet.date)) > 0)">
									<div v-if="delta.actual" :class="delta.actual < 0 ? 'text-warning' : 'text-success'">
										<i class="fas mb-0" :class="delta.actual >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
										{{delta.actual | currency}}
										({{delta.actualPercent * 100 | percent({precision: 2})}})
									</div>
									<div v-else class="text-muted">
										<i class="far fa-sm fa-exclamation-triangle"></i>
										Problem fetching data
									</div>
								</div>
								<div v-else>
									<div class="card-group">
										<div class="card h-100 m-0">
											<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
												<i class="h2 fas mb-0" :class="delta.estimate > 0 ? 'text-success fa-caret-up' : 'text-warning fa-caret-down'"></i>
											</div>
										</div>
										<div class="card h-100 m-0">
											<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
												<span class="text-center" :class="true ? 'text-success' : 'text-warning'">
													{{delta.estimate < 0 ? '-' : '+'}}
													{{delta.estimate | currency}}
													({{delta.estimatePercent * 100 | percent}})
												</span>
											</div>
										</div>
										<div class="card h-100 m-0">
											<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
												<div class="cs-gauge" :class="{'is-empty': !tweet.sentiment}">
													<div class="cs-gauge-pointer" :style="{'transform': `rotate(${(tweet.sentiment.affinPercent || 0) * 90}deg)`}"></div>
												</div>
											</div>
										</div>
										<!-- FIXME: assurity value
										<div class="card h-100 m-0">
											<div class="card-body d-flex align-items-center justify-content-center p-1" style="height: 58px;">
												<div class="badge badge-pill badge-warning m-0">
													23% assurity
												</div>
											</div>
										</div>
										-->
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn btn-light ml-auto" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->
		<!-- Sentiment modal {{{ -->
		<div class="modal" :id="`sentiment-modal-${tweet.platform}-${tweet.symbol}-${tweet._id}`">
			<div class="modal-dialog modal-dialog-centered shadow-none">
				<div v-if="tweet.sentiment" class="modal-content">
					<div class="modal-body">
						<!--
							Overall sentiment value for event — can be: a) positive (e.g. "20% positive"); b) negative (e.g. "33% negative"); c) Completely neutral at 0 ("Neutral") or d) Value couldn't be calculated? or it has not been picked up by the agent yet.
						-->
						<h5 class="text-center mt-4 mb-0">
							<div class="badge badge-pill mb-0" :class="{'badge-light': !tweet.sentiment, 'badge-warning': tweet.sentiment && tweet.sentiment.affinPercent < 0, 'badge-info': tweet.sentiment.affinPercent === 0, 'badge-success': tweet.sentiment.affinPercent > 0}">
								<span v-if="tweet.sentiment.affinPercent > 0">{{tweet.sentiment.affinPercent * 100 | percent}} positive</span>
								<span v-else-if="tweet.sentiment.affinPercent < 0">{{tweet.sentiment.affinPercent * 100 | percent}} negative</span>
								<span v-else-if="tweet.sentiment.affinPercent === 0">Neutral</span>
								<span v-else>Sentiment not calculated</span>
							</div>
						</h5>
						<!-- FIXME: radar plot of sentiment -->
						<div class="position-relative">
							<img class="w-100" src="/assets/images/sentiment-placeholder.svg" alt="" style="opacity: 0.33">
							<div class="position-absolute h-100 w-100 d-flex align-items-center justify-content-center top-0">
								<div class="badge badge-info">
									Coming soon
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn btn-light ml-auto" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
		<!-- }}} -->
	</div>
</template>

<style lang="scss">
.rivers-view-timeline-tweet {
	color: var(--black);
	text-decoration: none !important;

	&:hover {
		border-color: var(--primary) !important;

		& .btn.fa-chart-pie {
			background: var(--primary);
			color: var(--white);
		}
	}
}
</style>
