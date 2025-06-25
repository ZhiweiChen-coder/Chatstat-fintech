<script lang="js" frontend>
app.component('sitenav', {
});
</script>
<template>
	<!-- Navbar {{{ -->
	<header id="topnav" class="navbar navbar-expand-lg sticky-top navbar-light bg-white shadow-sm py-3">
		<div class="container w-100">
			<a class="navbar-brand logo w-auto mr-auto" href="/">
				<img src="/assets/logo/logo-full-primary.svg" height="32" alt="">
			</a>

			<button class="navbar-toggler navbar-toggle py-2 border-0" type="button" data-toggle="collapse" data-target="#sitenav">
				<i class="far fa-fw fa-bars"></i>
			</button>

			<div id="sitenav" class="collapse navbar-collapse justify-content-end">
				<hr class="d-lg-none my-3" size="0">
				<!-- Navigation Menu-->
				<ul class="navbar-nav">
					<li class="nav-item"><a href="#products" class="nav-link px-lg-3">Products</a></li>
					<li class="nav-item"><a href="/contactus" class="nav-link px-lg-3">Contact</a></li>
					<li class="nav-item"><a href="/faq" class="nav-link px-lg-3">FAQ</a></li>
					<li class="nav-item"><a href="#about" class="nav-link px-lg-3">About</a></li>
					<li class="nav-item"><a href="/signup" class="nav-link px-lg-3 d-lg-none">Sign up</a></li>
					<li class="nav-item"><a href="/login" class="nav-link d-lg-none">Log in</a></li>
				</ul>
				<a href="/signup" class="btn btn-outline-success d-none d-lg-inline-block ml-3">Sign up</a>
				<a href="/login" class="btn btn-success d-none d-lg-inline-block ml-2">Login</a>
			</div>
		</div>
	</header>
	<!-- }}} -->
</template>

<style scoped>
</style>