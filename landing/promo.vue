<script lang="js" frontend>
	/**
	* Promo page component
	* This replaces the page content within <landing/> if NO session is present
	*/
	//import staticRiverData from "./staticData/globalRiverStatic.json";
	app.component('promo', {
		data() { return {
			riverTitleCard: 'Trending Searches',
			riverApiCall: '/api/static/rivers',
			platformApiCall: '/api/static/platforms',
		}},
	});
</script>

<template>
	<!-- Negative margin to negate padding on doop content container -->
	<div class="mx-n3 mx-md-n4 my-n3">
		<sitenav/>
		<!-- Hero -->
		<section class="bg-home d-flex align-items-center bg-success h-auto" id="home">
			<div class="container-fluid container-lg px-4 px-md-5 px-lg-2">
				<div class="row justify-content-center">
					<div class="col" style="padding-top: 75px;">
						<div class="text-center mt-6">
							<h1 class="hero__heading text-white mb-3">
								Social Investment Insight &&nbsp;Alerts
							</h1>
							<p class="hero__tagline mb-0 text-white">
								Compare crypto price movements with social media posts to discover the influencers moving markets
							</p>
						</div>

						<div class="home-dashboard my-6 shadow-sm">
							<rivers-widget
								:riverTitleCard="riverTitleCard"
								:riverApiCall="riverApiCall"
								:platformApiCall="platformApiCall"
								:href="false"
							/>
							<div class="text-center mt-n7">
								<a class="btn btn-lg btn-success position-relative" href="/signup" style="z-index: 1;">Sign up</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
		<!-- Hero -->

		<!-- Plans -->
		<section class="bg-white py-7">
			<div class="container">
				<div class="row">
					<div class="col text-center">
						<h3 class="mb-3">Plans to suit every level of your requirements</h3>
						<p class="lead text-muted mx-auto mb-0">
							Knowledge is power. Get the advantage with unique insight from Chatstat
						</p>
					</div>
				</div>
			</div>

			<div class="container-fluid container-lg px-4 px-md-5 px-lg-2">
				<div class="table-responsive">
					<table class="plans-table table table-bordered mt-6 mb-0">
						<tbody>
							<tr>
								<th class="align-middle px-2 py-3">
									<a class="btn btn-success shadow-none text-nowrap" href="/signup">Try now for free</a>
								</th>
								<th class="align-middle bg-primary text-white text-center font-weight-normal py-2 py-3">
									<strong>Free3</strong>
									<br>3-Days Free
								</th>
								<th class="align-middle bg-primary text-white text-center font-weight-normal py-2 py-3">
									<strong>Free15</strong>
									<br>15-Days Free&nbsp;<sup>*</sup>
								</th>
								<th class="align-middle bg-primary text-white text-center font-weight-normal py-2 py-3">
									<strong>Essential</strong>
									<br>$4.95<sub>/month</sub>&nbsp;<sup>*</sup>
								</th>
								<th class="align-middle bg-primary text-white text-center font-weight-normal py-2 py-3">
									<strong>Professional</strong>
									<br>$12.95<sub>/month</sub>&nbsp;<sup>*</sup>
								</th>
								<th class="align-middle bg-primary text-white text-center font-weight-normal py-2 py-3">
									<strong>Premium</strong>
									<br>$19.95<sub>/month</sub>&nbsp;<sup>*</sup>
								</th>
								<th class="align-middle bg-primary text-white text-center font-weight-normal py-2 py-3">
									<strong>Enterprise</strong>
									<br><a class="text-white" href="/contactus">Enquire Now</a>
								</th>
							</tr>

							<tr>
								<th colspan="7" class="bg-light p-2">Account Duration</th>
							</tr>
							<tr>
								<td class="py-2">3 Days</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
							</tr>
							<tr>
								<td class="py-2">15 Days</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
							</tr>
							<tr>
								<td class="py-2">Monthly</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>

							<tr>
								<th colspan="7" class="bg-light p-2">Verification Needed</th>
							</tr>
							<tr>
								<td class="py-2">Credit Card</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">Email</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>

							<tr>
								<th colspan="7" class="bg-light p-2">Platforms Supported</th>
							</tr>
							<tr>
								<td class="py-2">Twitter</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">Reddit, Weibo, Facebook, RSS</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>

							<tr>
								<th colspan="7" class="bg-light p-2">Exchanges Supported</th>
							</tr>
							<tr>
								<td class="py-2">Bitfinex</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">NYSE, Nasdaq, ASX</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>

							<tr>
								<th colspan="7" class="bg-light p-2">Essential Features</th>
							</tr>
							<tr>
								<td class="py-2">Alerts</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">Trending Posts</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">Timeline View</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">Sentiment Analysis</td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>

							<tr>
								<th colspan="7" class="bg-light p-2">Enterprise Needs</th>
							</tr>
							<tr>
								<td class="py-2">API Access</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
							<tr>
								<td class="py-2">Custom Features</td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-times-circle text-secondary"></i></td>
								<td class="text-center"><i class="fas fa-check-circle text-success"></i></td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="row justify-content-center mt-5">
					<div class="col-sm-10 col-xl-8 text-center">
						<small class="text-muted">
							<sup>*</sup> To enable your continued use of the features your account will automatically be debited at the end of your pricing period, unless cancelled at least 5 business day prior.
						</small>
					</div>
				</div>
			</div>
		</section>
		<!-- Plans -->

		<!-- Contact -->
		<section class="container py-7">
			<div class="row justify-content-center">
				<div class="col-lg-8 col-xl-6 text-center">
					<h3 class="my-3">We'd Love to Hear From You!</h3>
					<p class="lead text-muted mx-auto mb-0">
						With any question, comment or suggestion you have, we look forward to helping&nbsp;you&nbsp;:)
					</p>
				</div>
			</div>
			<div class="row justify-content-center mt-6">
				<div class="col-lg-9">
					<contactform/>
				</div>
			</div>
		</section>
		<!-- Contact -->

		<!-- Footer -->
		<sitefooter/>
		<!-- Footer -->

		<!-- Video Popup -->
		<div class="modal fade" id="watchvideomodal" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered modal-lg">
				<div class="modal-content video-modal rounded overflow-hidden">
					<!-- <div class="ratio ratio-16x9">
						<iframe src="https://www.youtube.com/embed/jNTZpfXYJa4?rel=0" title="YouTube video" allowfullscreen></iframe>
					</div> -->
					<!--If you want to use the youtube link please try the above code-->

					<div class="ratio ratio-16x9">
						<iframe src="http://player.vimeo.com/video/99025203" title="Vimeo video" allowfullscreen></iframe>
					</div>
					<!--If you want to use the Vimeo link please try the above code-->
				</div>
			</div>
		</div>
		<!-- Video Popup -->

		<!-- Back to top -->
		<a href="#" class="back-to-top rounded text-center" id="back-to-top">
			<i class="mdi mdi-chevron-up d-block"> </i>
		</a>
	</div>
</template>

<style scoped>
	@import './assets/styles/bootstrap.min.css';
	@import './assets/styles/materialdesignicons.min.css';
	/* FIXME: font paths are broken */
	/* @import './assets/styles/line.css'; */
	@import './assets/scss/style';
	@import './assets/styles/colors/default.css';

	.home-dashboard {
		height: calc(100vh - 75px - 7.5rem);
		min-height: 460px;
	}

	.hero__heading {
		font-family: Helvetica, Arial, sans-serif;
		font-size: 40px;
		line-height: 1em;
		letter-spacing: -0.02em;

		@media (min-width: 768px) {
			font-size: 45px;
		}

		@media (min-width: 1200px) {
			font-size: 60px;
		}
	}

	.hero__tagline {
		font-family: Trebuchet MS, Helvetica, 'Arial', sans-serif;
		font-size: 21px;
		line-height: 32px;
	}

	.plans-table {
		width: 100%;
		overflow: auto;
	}

	.plans-table td {
		&:first-of-type {
			min-width: 180px;
			width: 33%;
		}

		&:nth-child(n+2) {
			min-width: 100px;
		}
	}
</style>
