export default {
	data() { return {
		enumIter: [],
		enumPrefetch: true, // Enable/disable monitoring of enumUrl and enum for changes
	}},
	props: {
		enumSource: {
			type: 'mgChoiceButtons',
			enum: ['list', 'url'],
			default: 'list',
			help: 'Where to populate the list data from'
		},
		enum: {
			type: 'mgTable',
			title: 'List items',
			showIf: 'enumSource == "list"',
			items: [
				{id: 'id', type: 'mgText', required: true},
				{id: 'title', type: 'mgText', required: true},
				{id: 'icon', type: 'mgIcon'},
			],
		},
		enumUrl: {
			type: 'mgUrl',
			vueType: ['string', 'object'],
			showIf: 'enumSource == "url"',
			help: 'Data feed URL to fetch choice values from'
		},
		optionsPath: {
			type: "mgText",
			default: "",
			help: "Path within data for options array",
		},
		optionKeyPath: {
			type: "mgText",
			default: "id",
			help: "Path within data for options key",
		},
		optionLabelPath: {
			type: "mgText",
			default: "title",
			help: "Path within data for options label",
		},
		optionIconPath: {
			type: "mgText",
			default: "icon",
			help: "Path within data for options icon",
		},
	},
	computed: {
		options() {
			return _.get(this.enumIter, this.$props.optionsPath, this.enumIter);
		},
	},
	methods: {
		// TODO: Default "select" and "setEnum" before custom overloads in components?\

		/**
		 * Lookup or fetch data and apply query
		 * @param {String} query Filter data by search string
		 * @returns {Promise}
		 */
		// TODO: Better name? It's not really fetch... search, filter...
		getEnum(query = '') {
			this.$debug('getEnum', this.$props.enumSource, query);
			switch (this.$props.enumSource) {
				case 'list':
					return Promise.resolve(this.filterOptionsByLabel(query));

				// FIXME: Previous undocumented behavour may have been to enable whenever "enumUrl" is provided
				case 'url':
					if (!this.$props.enumUrl) return Promise.resolve();

					return this.$macgyver.utils
						// FIXME: Appended straight on? No "?" or anything before it?
						.fetch(this.$props.enumUrl + query, { type: 'array' })
						.then(data => {
							if (_.isFunction(this.setEnum)) {
								this.setEnum(data);
							} else {
								this.enumIter = data;
							}
						});
			}
		},

		/**
		 * Search for an enum option given a key
		 * @param {String, Number} key
		 */
		findOptionByKey(key) {
			return this.options.find(option => this.getOptionKey(option) === key);
		},

		filterOptionsByLabel(label) {
			return this.enumIter.filter(option => (!label || this.getOptionLabel(option).toLowerCase().startsWith(label.toLowerCase())))
		},

		/**
		* Retrieve option key based on path specified in properties.
		* @param {Object} option The selected option within enum
		*/
		getOptionKey(option) {
			return _.get(option, this.$props.optionKeyPath, '');
		},

		/**
		* Retrieve option label based on path specified in properties.
		* @param {Object} option The selected option within enum
		*/
		getOptionLabel(option) {
			return _.get(option, this.$props.optionLabelPath, '');
		},

		/**
		* Retrieve option icon based on path specified in properties.
		* @param {Object} option The selected option within enum
		*/
		getOptionIcon(option) {
			return _.get(option, this.$props.optionLabelPath, '');
		},
	},
	// NOTE: Mixin lifecycle callbacks run before component itself; "enumPrefetch = false" must be set in "created" to disable watcher being triggered immediately.
	// FIXME: To configure this during "created" might require a factory pattern where this mixin is provided preconfiged based on args provided to the factory.
	mounted() {
		this.$watch('$props.enumUrl', () => {
			if (this.$props.enumSource === 'url') this.getEnum();
		}, {immediate: this.enumPrefetch});

		// FIXME: Does this need to watch "$data.data"?
		this.$watchAll(['$props.enum', '$data.data'], ()=> {
			if (_.isArray(this.$props.enum) && this.$props.enum.every(_.isString)) { // Array of strings
				if (_.isFunction(this.setEnum)) {
					this.setEnum(this.$props.enum.map(i => ({id: _.camelCase(i), title: i})));
				} else {
					this.enumIter = this.$props.enum.map(i => ({id: _.camelCase(i), title: i}));
				}
			} else if (_.isArray(this.$props.enum) && this.$props.enum.every(_.isObject)) { // Collection
				if (_.isFunction(this.setEnum)) {
					this.setEnum(this.$props.enum);
				} else {
					this.enumIter = this.$props.enum;
				}
			}
		}, {immediate: true});
	},
};