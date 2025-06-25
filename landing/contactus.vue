
<script lang="js" frontend>
/**
* Generic landing page
* This page loads either a basic informative squeeze page or <dashboard/> depending on if a session is present
*/
app.component('contactus', {
	route: '/contactus',
	routeRequiresAuth: false,
});
</script>

<template>
	<div class="mx-n3 mx-md-n4 bg-white">
		<sitenav/>
		<div class="container py-7">
			<div class="row justify-content-center">
				<h1 class="display-4 mb-0 text-center">Contact Us</h1>
				<p class="text-center mt-5">
					Duis laoreet consequat felis, sed luctus ante mollis id. Cras volutpat tortor sit amet suscipit ullamcorper. Nullam congue mauris nec urna convallis, at maximus sapien commodo. Donec sed ornare purus, vel egestas libero. Cras sollicitudin posuere mi eu tristique. Suspendisse sit amet felis semper, auctor diam sed, lacinia elit. Fusce vel sodales ex, auctor suscipit lectus. Donec lacinia egestas ullamcorper.
				</p>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-9 mt-6">
					<contactform/>
				</div>
			</div>
		</div>
		<sitefooter/>
	</div>
</template>
