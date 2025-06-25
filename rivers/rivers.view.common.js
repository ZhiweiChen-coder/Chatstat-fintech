// TODO: Doop3 supports mixin by string name?
//<script lang="js" frontend>
//app.mixin('riversViewCommon', {

export default {
	methods: {
		/**
		 * Retrieve stream and flow data given a river
		 * @returns {Promise} Resolves when API request is complete
		 */
		refresh(flow, river, period, limit = 0) {
			this.$debug('refresh', flow, river?.streams, period);
			if (!flow || !river?.streams) return;

			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.loadFlow(flow, period))
				.then(()=> this.loadStreams(
					river.streams,
					river.terms
						.filter(t => t.isActive && _.isString(t.term))
						.map(t => t.term.toLowerCase()),
					period,
					limit
				))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},

		/**
		 * Retrieve flow data for the for the selected start/finish dates
		 * Flow data consists of price exchange information; Such as Bitfinex candles
		 * 
		 * @param {object} flow The selected flow to be loaded
		 * @returns {Promise} Resolves when API request is complete
		 */
		loadFlow(flow, period) {
			if (!flow) return;
			this.$debug('loadFlow', flow, period);

			// Check for partially loaded rivers/flows
			//if (
			//	_.isObject(this.riversViewResults?.flow)
			//	&& _.isArray(this.riversViewResults?.river?.flows)
			//	&& !this.riversViewResults.river?.flows.includes(this.riversViewResults.flow)
			//) return;

			const qry = {
				start: undefined,
				finish: undefined,
			};
			if (period?.oldest > 0) qry.start = moment(period.oldest).utc().format('x');
			if (period?.newest > 0) qry.finish = moment(period.newest).utc().format('x');
			this.$debug('loadFlow', 'qry', qry);

			return this.$http.get(`${this.$props.platformApiCall}/${flow.platform}/${flow.symbol}`, { params: qry })
				.then(({data}) => this.flowData = data);
		},

		/**
		 * Retrieve stream data for the for the selected start/finish dates
		 * Stream data consists of social media content; Such as tweets
		 * 
		 * @param {array<object>} streams A list of streams to be retrieved
		 * @param {array<string>} terms A list of terms to filter against
		 * @returns {Promise} Resolves when API request is complete
		 */
		loadStreams(streams, terms, period, limit = 0) {
			this.$debug('loadStreams', streams, terms, period);

			// Query data outside of existing range
			// start: date.$gte
			// finish: date.$lt
			const qry = {
				terms: terms,
				limit: limit, // TODO: Configurable by dropdown?
				start: undefined,
				finish: undefined,
			};
			if (period?.oldest > 0) qry.start = moment(period.oldest).utc().format('x');
			if (period?.newest > 0) qry.finish = moment(period.newest).utc().format('x');
			this.$debug('loadStreams', 'qry', qry);

			return Promise.all(streams.map(s => {
				this.$http.get(`${this.$props.platformApiCall}/${s.platform}/${s.symbol}`, { params: qry })
				.then(({data}) => this.streamsData = data);
			}));
		},
	},
	mounted() {
		this.$debug.enable(false);
	},
}
//});
//</script>
