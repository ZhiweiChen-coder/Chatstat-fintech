<script lang="js" frontend>
app.component('sitefooter', {
});
</script>
<template>
<!-- Footer -->
<footer class="site-footer">
	<section class="site-footer__primary">
		<div class="container text-left">
			<div class="row">
				<div class="col-lg-4">
					<a class="logo-footer text-light" href="#">
						<img src="/assets/logo/logo-full-white.svg" height="30" alt="">
					</a>
					<p class="mt-4">
						<a class="text-white" href="tel:+16503889589">+1 650 388 9589</a>
					</p>
				</div>

				<div class="col-lg-8 mt-5 mt-lg-0">
					<h4 class="text-light footer-head mb-2">Locations</h4>
					<ul class="list-unstyled row footer-list my-0">
						<li class="col-sm-6 col-md-4 mt-1"><i class="mdi mdi-chevron-right me-1"></i> Palo Alto</li>
						<li class="col-sm-6 col-md-4 mt-1"><i class="mdi mdi-chevron-right me-1"></i> London</li>
						<li class="col-sm-6 col-md-4 mt-1"><i class="mdi mdi-chevron-right me-1"></i> Sydney</li>
						<li class="col-sm-6 col-md-4 mt-1"><i class="mdi mdi-chevron-right me-1"></i> Singapore</li>
						<li class="col-sm-6 col-md-4 mt-1"><i class="mdi mdi-chevron-right me-1"></i> Frankfurt</li>
						<li class="col-sm-6 col-md-4 mt-1"><i class="mdi mdi-chevron-right me-1"></i> Madrid</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
	<section class="site-footer__secondary">
		<div class="container text-center">
			<div class="row align-items-center justify-content-center">
				<div class="col-sm-6">
					<p class="mb-0">
						© {{ new Date().getFullYear() }} ChatStat
					</p>
				</div>
				<!-- <div class="col-sm-6 mt-4 mt-sm-0 pt-2 pt-sm-0">
					<ul class="list-unstyled text-sm-end social-icon social mb-0">
						<li class="list-inline-item"><a href="javascript:void(0)" class="rounded"><i class="mdi mdi-facebook" title="Facebook"></i></a></li>
						<li class="list-inline-item"><a href="javascript:void(0)" class="rounded"><i class="mdi mdi-instagram" title="Instagram"></i></a></li>
						<li class="list-inline-item"><a href="javascript:void(0)" class="rounded"><i class="mdi mdi-twitter" title="Twitter"></i></a></li>
						<li class="list-inline-item"><a href="javascript:void(0)" class="rounded"><i class="mdi mdi-google-plus" title="Google +"></i></a></li>
						<li class="list-inline-item"><a href="javascript:void(0)" class="rounded"><i class="mdi mdi-linkedin" title="Linkedin"></i></a></li>
					</ul>
				</div> -->
			</div>
		</div>
	</section>
	<!-- Footer -->
</footer>
</template>

<style scoped>
	.site-footer {
		background-color: #3b4757;
		font-size: 16px;
		line-height: 1.6em;
	}

	.site-footer__primary,
	.site-footer__secondary {
		color: #adb5bd;
		position: relative;
	}

	.site-footer__primary {
		padding: 60px 0;
	}

	.site-footer__secondary {
		padding: 30px 0;
		border-top: 1px solid #6c757d;
	}

	.footer-head {
		font-size: 18px;
		letter-spacing: 0.8px;
		font-weight: 600;
	}

	.footer-list > li + li {
		margin-top: 10px;
	}

	.text-foot {
		color: #adb5bd;
		text-decoration: none;

		&:hover {
			color: #25D366;
		}
	}

	.social-icon a {
		border: 1px solid #adb5bd;
		color: #adb5bd;
		display: inline-block;
		height: 32px;
		text-align: center;
		font-size: 15px;
		width: 32px;
		line-height: 30px;
		transition: all 0.4s ease;
		overflow: hidden;
		position: relative;

		&:hover {
			background-color: #25D366;
			border-color: #25D366;
			color: #fff;
		}
	}
</style>