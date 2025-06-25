<script lang="js" frontend>
/**
* This is the top level Vue component which handles all other child components
*/
app.component('layoutRoot', {
	data() {
		return {
			// FIXME: Remember last state set by user
			showSidebar: true,
		}
	},
	methods: {
	},
	mounted() {
		$('body').removeClass('bootstrapping');
		$('body > .splash').removeAttr('style'); // Remove {display: none} overrides for early-load, root level elements allowing CSS precidence to take over now Vue has loaded
	},
});
</script>

<template>
	<main class="d-flex flex-column bg-light vh-100 vw-100 overflow-auto">
		<!-- Sitenav {{{ -->
		<header class="sticky-top shadow-sm topbar">
			<nav class="navbar navbar-dark bg-success px-3 px-md-4">
				<a class="navbar-brand mr-0" href="/">
					<img src="/assets/logo/logo-full-white.svg" height="38">
				</a>
				<button class="btn btn-outline-dark border-secondary mr-0 mr-lg-auto" type="button" @click="showSidebar = !showSidebar">
					<i class="far fa-fw fa-lg fa-bars"></i>
				</button>

				<ul class="list-inline mb-0 mr-n2 d-none d-lg-inline">
					<user-dropdown></user-dropdown>
				</ul>
			</nav>
		</header>
		<!-- }}} -->

		<!-- Content area {{{ -->
		<div class="d-flex flex-grow-1 bg-light position-relative overflow-auto">
			<aside class="sidebar col-auto p-0 h-100 bg-white overflow-auto border-right"
				v-if="$session.isLoggedIn && $route.path.indexOf('/recover') !== 0"
				:class="{'is-hidden' : !showSidebar}">
				<sitemap-sidebar/>
			</aside>

			<div class="col h-100 p-0">
				<!-- <sitemap-breadcrumbs/> -->
				<!-- px-3 px-md-4 py-4 -->
				<!-- Page transitions are managed by $transitions service -->
				<transition
					:name="$transitions.current.class"
					:duration="$transitions.current.maxKeepAlive"
					:css="$transitions.current.class != 'page-transition-none'"
				>
					<div class="content-area h-100 overflow-auto" :key="$router.routeVersion">
						<div class="px-3 px-md-4 h-100">
							<router-view></router-view>
						</div>
					</div>
				</transition>
			</div>
		</div>
		<!-- }}} -->

		<!-- Helpers / Plugins {{{ -->
		<vue-snotify/>
		<prompt-injector/>
		<!-- }}} -->
	</main>
</template>

<style>
	.navbar-brand {
		width: 15rem;
	}

	.sidebar {
		margin-left: 0;
		transition: margin-left 250ms ease-in-out;
	}
	.sidebar.is-hidden {
		margin-left: -15rem;
	}

	@media (max-width: 991px) {
		.navbar-brand {
			width: auto;
		}

		.sidebar {
			position: absolute !important;
			width: 15rem !important;
			z-index: 1;
		}
	}

	@media (min-width: 992px) {
	}
</style>
