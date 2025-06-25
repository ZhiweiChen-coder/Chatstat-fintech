
<script lang="js" frontend>
app.component('contactform', {
		data: ()=> ({
			data: {
				email: '',
				name: '',
				message: '',
				enquiryType: '',
			},
			items: ['Accounts', 'Support', 'Sales', 'Suggestions', 'Partnerships', 'Integrations', 'Other Questions'],
			errors: [],
		}),
		created() {
			this.defaultData = JSON.parse(JSON.stringify(this.data))
		},
		destroyed() {
			this.defaultData = null
		},
	methods: {
		clearAll() {
			this.data = Object.assign({}, this.defaultData)
		},
		contactus(notification = false, redirect = false) {
			return Promise.resolve()
				.then(()=> this.$http.post('/api/contactus', this.data))
				.then(() => this.clearAll())
				.then(()=> $('body').removeClass('minimal'))
				.then(()=> notification && this.$toast.success('Message Successfully Sent'))
				.catch(e => {
					if (e.toString().startsWith('NavigationDuplicated')) return // Ignore $router complaints
					this.$toast.catch(e, {position: 'centerBottom'})
				})
				// .finally(()=> this.$loader.stop())
		},
		setSelected(value) {
			this.data.enquiryType = value
		},
		checkForm: function (e) {
			if (this.data.email && this.data.name && this.data.message && this.data.enquiryType) {
				this.contactus(true)
				return true
			}
			return false
		}
	},

})

</script>
<template>
	<form
	@submit.prevent="checkForm"
	>
		<div class="row justify-content-center align-items-center">
			<div class="col-md-4">
				<div class="mb-3">
					<label>
						<span class="font-weight-bolder">Name</span>
						<span class="text-warning">*</span></label>
					<input name="name" id="name" type="text" class="form-control" v-model="data.name" placeholder="Name" required>
				</div>
			</div>
			<div class="col-md-4">
				<div class="mb-3">
					<label>
						<span class="font-weight-bolder">Email</span>
						<span class="text-warning">*</span></label>
					<input name="email" id="email" type="email" class="form-control" v-model="data.email" placeholder="Your email" required>
				</div>
			</div>
			<div class="col-md-4">
				<div class="mb-3">
					<label>
						<span class="font-weight-bolder">Enquiry type</span>
						<span class="text-warning">*</span></label>
					<select class="custom-select" v-model="data.enquiryType" required>
						<option value="" selected disabled>Please select an option</option>
						<option v-for="option in items" :value="option">{{option}}</option>
					</select>
				</div>
			</div>
			<div class="col-12">
				<div class="mb-3">
					<label>
						<span class="font-weight-bolder">Your Message</span>
						<span class="text-warning">*</span></label>
					<textarea name="message" id="message" class="form-control" v-model="data.message" rows="4" required></textarea>
				</div>
			</div>
			  <p v-if="errors.length">
				<b>Please correct the following error(s):</b>
				<ul>
				<li :v-for="error in errors">{{ error }}</li>
				</ul>
			</p>
			<div class="col-md-6 mt-2">
				<button id="contactus" type="submit" value="Submit" class="btn btn-lg btn-primary w-100 mb-2">Contact us</button>
			</div>
		</div>
	</form>

</template>

<style scoped>
</style>
