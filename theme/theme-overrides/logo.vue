<style>
/* Logo display on main page is too big */
.topbar .logo .logo-inner-sm, .topbar .logo .logo-inner-lg {
	display: none;
}

body:not(.screen-xs) #wrapper:not(.enlarged) .topbar .logo .logo-inner-lg {
	display: block;
}

#wrapper.enlarged .topbar .logo .logo-inner-sm {
	display: block;
}

/* Force small logo on mobile screens */
body.screen-xs .topbar .logo .logo-inner-sm {
	display: block !important;
}

.topbar .logo .logo-inner-sm img {
	width: 100%;
	height: 100%;
	padding: 0 10px;
	max-height: 70px;
}

.topbar .logo .logo-inner-lg img {
	width: 100%;
	height: 100%;
	padding: 0 30px;
	max-height: 40px;
}
</style>
