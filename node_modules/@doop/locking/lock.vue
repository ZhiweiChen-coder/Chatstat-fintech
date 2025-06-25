<script lang="js" frontend>
import Debug from '@doop/debug';
const $debug =  Debug('@doop/locking').enable(true);

/**
* Contents of the $prompt.dialog() shown when a document is locked
* @param {Object} lock The lock to obtain as a complex object (hashed by the backend)
* @param {boolean} [enabled=true] Enable/disable locking mechanism as required
* @param {string} [title=""] Optional title for the modal
* @param {string} [body="This document is locked by"] Message to display when a lock is present
* @param {number} [queryInterval=2000] How frequently to check the lock exists
* @param {boolean} [modal=true] Optionally disable modal display
*
* @slot default Main content area with access to lock properties
* @slot modal Overridable modal design
* @slot modal-body Overridable body area
*
* @example Simple implementation without expose properties
* <lock :lock="{ foo: 'bar' }">Contents</lock>
*
* @example Default slot properties exposed
* <lock :lock="{ foo: 'bar' }" #default="lock">{{lock.isMyLock}}</lock>
*
* @example Default slot properties exposed to template
* <lock :lock="{ foo: 'bar' }"><template #default="lock">{{lock.isMyLock}}</template></lock>
*
*/
app.component('lock', {
	data() { return {
		isMyLock: false,
		isShowingModal: false,
		lockPending: undefined,
		lockTimer: undefined,
		lockData: undefined,
	}},
	props: {
		lock: {type: Object, required: true},
		enabled:  {type: Boolean, default: true},
		title: {type: String, default: ''},
		body: {type: String, default: 'This document is locked by'},
		queryInterval: {type: Number, default: 2000},
		modal: {type: Boolean, default: true},
	},
	methods: {
		/**
		* Optimistaclly try to obtain a lock
		* Called automatically on mount
		* @returns {Promise<boolean>} Boolean true if the lock creation was successful, false otherwise
		*/
		create() {
			if (!this.enabled) return;

			return Promise.resolve()
				.then(()=> this.$loader.start()) // Foreground loader to block UI until we know if a lock exists
				.then(()=> this.$http.post('/api/locks/create', this.lock))
				.then(data=> {
					this.isMyLock = true;
					this.dismiss();
				})
				.catch(e => {
					if (e.err !== 'Already locked') this.$toast.catch(e); // Report all non locking errors
					this.show();
				})
				.finally(()=> this.$loader.stop())
				.finally(()=> this.$debug('LOCK CREATE DONE', {isMyLock: this.isMyLock}))
				.finally(()=> this.tick());
		},


		/**
		* Check if the lock still exists or touch it if we own it
		* This function calls dismiss() when the lock is released
		* @returns {Promise} A promise which will resolve after one check cycle
		*/
		tick() {
			clearTimeout(this.lockTimer); // Cancel any scheduled lock timer if there is one
			return this.lockPending = this.$http.post('/api/locks/hydrate', this.lock)
				.then(res => {
					this.lockData = res.data;

					// No existing lock
					if (!this.lockData) {
						this.isMyLock = false;
						return this.create();

					// User is owner of existing lock
					} else if (this.lockData?.user == this.$session.data._id) { // Its now our lock
						this.isMyLock = true;
						return this.dismiss();

					// Someone else is owner of existing lock
					} else if (this.lockData?.user != this.$session.data._id) { // Lock is owned by someone else
						this.isMyLock = false;
						return this.show();
					}
				})
				//.catch(e => this.$debug('catch', e))
				.finally(()=> this.$debug('TICK DONE', {isMyLock: this.isMyLock, lockData: this.lockData}))
				.finally(()=> this.lockTimer = setTimeout(this.tick, this.queryInterval)) // Reschedule the timer
		},


		/**
		* A lock is present - display the modal and keep checking until it expires
		*/
		show() {
			if (!this.enabled || !this.modal || this.isShowingModal) return;

			this.$debug('Show lock dialog', this._uid);
			this.$prompt.modal({
				element: `#modal-lock-${this._uid}`,
				backdrop: 'static', // Not dismissible by clicking on backdrop
			});
			this.isShowingModal = true;
		},


		/**
		* Dismiss the dialog
		* NOTE: This does not release the lock, just closes the dialog, it should not be called directly
		*/
		dismiss() {
			if (!this.modal || !this.isShowingModal) return;

			this.$debug('Dismiss lock dialog');
			this.$prompt.close(true);
			this.isShowingModal = false;
		},


		/**
		* Attempt to transfer the lock to this user
		* @returns {Promise} A promise which will resolve if successful or throw if not
		*/
		kick() {
			return this.$http.post('/api/locks/release', this.lock)
				.catch(this.$toast.catch)
		},
	},

	created() {
		this.$debug = $debug;
	},

	mounted() {
		return this.create();
	},

	beforeDestroy() {
		clearTimeout(this.lockTimer); // Release timer handle if we have one
		return Promise.resolve()
			.then(() => this.lockPending) // Wait for any pending ticks
			.then(() => this.$http.post('/api/locks/release', this.lock))
			.then(res => this.$debug('Released', res.data))
			.catch(this.$toast.catch);
	},
});

/*
	
*/
</script>

<template>
	<div class="lock">
		<slot name="default" :is-my-lock="isMyLock" :is-showing-modal="isShowingModal"></slot>
		<slot name="modal">
			<div :id="`modal-lock-${_uid}`" class="modal" tabindex="-1" role="dialog">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div v-if="title" class="modal-header">
							<h4 class="modal-title">{{title}}</h4>
						</div>
						<div class="modal-body">
							<slot name="modal-body">
								<h2 class="text-center mb-3">
									{{body}}
								</h2>
							</slot>
							<div class="text-center">
								<digest
									v-if="lockData && lockData.user"
									:url="`/api/users/${lockData.user}`"
									field="name"
									:lazy="false"
									class-valid="badge badge-primary font-lg"
									class-invalid="text-danger"
									text-invalid="An unknown user"
									icon-valid="far fa-user"
									icon-invalid="far fa-exclamation-triangle"
								/>
							</div>
							<div v-if="lockData && lockData.created" class="text-center text-muted mt-3">
								Started editing at
								<date :date="lockData.created" format="h:mma" class="d-inline-block"/>
							</div>
						</div>
						<div v-permissions="'locksKick'" class="modal-footer justify-content-center">
							<a @click="kick" class="btn btn-danger">
								<i class="far fa-unlock"/>
								Kick user
							</a>
						</div>
					</div>
				</div>
			</div>
		</slot>
	</div>
</template>
