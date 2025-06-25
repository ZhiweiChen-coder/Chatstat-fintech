<script lang="js" frontend>
/**
* View the detailed analysis for a specific tweet
* @param {string} $route.params.tweet The stream to view this tweet against
*/
app.component({
	route: '/tweets/:tweet',
	data() { return {
		tweet: undefined,
	}},
	methods: {
		/**
		* Fetch all data from the $route details
		* @returns {Promise} A promise which resolves when the operation has completed
		*/
		refresh() {
			this.$debug('refresh', this.$route.params.tweet);

			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/platforms/twitter/point/${this.$route.params.tweet}`))
				.then(({data}) => data || Promise.reject('Tweet not valid'))
				.then(data => this.tweet = data)
				.then(()=> {
					if(!this.tweet.sentiment) this.tweet.sentiment = {
						affinPercent: 0,
						affin: 0,
					}
				})
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.$debug.enable(false);

		this.refresh();
	},
});
</script>

<template>
	<div class="rivers-view-tweet" v-if="tweet">
		<rivers-view-timeline-tweet
			:tweet="tweet"
		/>
	</div>
</template>
