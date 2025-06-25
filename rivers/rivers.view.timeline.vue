<script lang="js" frontend>
// TODO: Via `app.mixin`; Doop3 allows lookup by name with `mixins: ['riversViewCommon']`?
const riversViewCommon = require('./rivers.view.common.js').default;

app.component('riversViewTimeline', {
	inject: ['riversViewResults'],
	mixins: [riversViewCommon],
	data() { return {
		streamsData: [],
	}},
	props: {
		'platformApiCall': {type: String, default: '/api/platforms'},
		limit: {type: Number, default: 15}, // TODO: Configurable by dropdown?
	},
	computed: {
		/**
		 * Compute the oldest and newest dates for which the timeline covers
		 * @returns {object} Oldest and Newest dates
		 */
		period() {
			return {
				oldest: moment(new Date(0)).utc(), // We're only limited by count, not time
				newest: (this.riversViewResults.river?.now)
					? moment(this.riversViewResults.river?.now).utc()
					: moment().utc().endOf('day'),
			};
		},
	},
	methods: {
		/**
		 * Compares downloaded data to requested data to progressively download on request
		 *
		 * @returns {Promise}
		 */
		loadMore() {
			// Find existing extents
			const existing = {
				oldest: moment().utc().endOf('day'),
				newest: moment().utc().endOf('day'),
			};

			// FIXME: If terms have changed then full range will need to be re-queried
			if (this.streamsData.length > 0) {
				existing.oldest = moment(this.streamsData[this.streamsData.length - 1]?.date).utc();
				existing.newest = moment(this.streamsData[0]?.date).utc();
			}
			//this.$debug('existing', existing);

			// Query data outside of existing range
			// start: date.$gte
			// finish: date.$lt
			const period = {
				oldest: this.period.oldest, // Try to get it all
				newest: existing.oldest.isBefore(this.period.newest)
					? existing.oldest
					: this.period.newest, // Stop at what we've already got
			};
			this.$debug('loadMore', 'period', period);

			// FIXME: Rather than refreshing, we need to fetch more stream data and append it
			const qry = {
				start: period.oldest.format('x'),
				finish: period.newest.format('x'),
				terms: this.riversViewResults.river?.terms
					.filter(t => t.isActive && _.isString(t.term))
					.map(t => t.term.toLowerCase()),
				limit: this.limit,
			};
			this.$debug('loadMore', 'qry', qry);

			return Promise.all(this.riversViewResults.river?.streams.map(s =>
				this.$http.get(`${this.$props.platformApiCall}/${s.platform}/${s.symbol}`, { params: qry })
					.then(({data}) => this.streamsData.push(...data))
			));
		},
	},
	mounted() {
		this.$debug.enable(false);

		this.$watch('period', () => {
			this.$debug('$watch.period', this.period);
			this.refresh(
				this.riversViewResults.flow,
				this.riversViewResults.river,
				this.period,
				this.limit,
			);
		}, {immediate: false, deep: false});

		this.$watch('riversViewResults.flow', () => {
			this.$debug('$watch.riversViewResults.flow', this.$el, this.riversViewResults.flow);
			this.refresh(
				this.riversViewResults.flow,
				this.riversViewResults.river,
				this.period,
				this.limit,
			);
		}, {immediate: true, deep: false});
	}
});
</script>

<template>
	<div class="rivers-view-timeline h-100">
		<section class="flex-grow-1 my-2">
			<div v-if="$loader.loading || streamsData.length == 0" class="d-flex align-items-center justify-content-center h-100 w-100 bg-light text-muted py-3">
				<p v-if="$loader.loading" class="mb-0">
					<i class="far fa-fw fa-spinner-third fa-spin text-success"></i>
					<span class="text-muted">Loading timeline</span>
				</p>
				<p v-else-if="!riversViewResults.river" class="mb-0">
					<span>Invalid River</span>
				</p>
				<p v-else-if="streamsData.length == 0" class="mb-0">
					<span>No data for timeline</span>
				</p>
			</div>
			<ul v-else class="list-unstyled">
				<li class="mt-3" v-for="tweet in streamsData" :key="tweet._id">
					<rivers-view-timeline-tweet
						v-if="tweet.platform == 'twitter'"
						:platform="riversViewResults.flow.platform"
						:symbol="riversViewResults.flow.symbol"
						:tweet="tweet"
					/>
				</li>
				<li style="text-align: center;" class="justify-content-center mt-2">
					<!-- TODO: How to determine if there are more pages? -->
					<button class="btn btn-success" @click="loadMore">Load more...</button>
				</li>
			</ul>
		</section>
	</div>
</template>



