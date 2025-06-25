<script lang="js" frontend>
/**
* Generic landing page
* This page loads either a basic informative squeeze page or <dashboard/> depending on if a session is present
*/
app.component('landing', {
	route: '/',
	routeRequiresAuth: false,
});
</script>

<template>
	<div class="h-100 py-3">
		<!-- FIXME: General public and admin user types -->
		<user-dashboard v-if="$session.isLoggedIn"/>
		<!-- <admin-dashboard v-if-else="$session.isLoggedIn && FIXME.isAdmin"/> -->
		<promo v-else/>
	</div>
</template>
