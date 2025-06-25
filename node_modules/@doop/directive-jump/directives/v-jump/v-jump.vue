<script lang="js" frontend>
import Debug from '@doop/debug';

var debug = Debug('v-href').enable(true);

var jumpSettings = {
	tryMaximum: 10, // Maximum number of tries before giving up
	tryInterval: 200, // Millisecond gap between tries, this multiplied by tryMaximum is the amount of time to wait before giving up (default: 2s)
};

var jumps = {}; // Dictionary of active jumps to `el` binding


/**
* Specify a <a/>-esk anchor within a webpage that can be jumped to
* When navigating to a page, we wait for Vue to settle everything (see jumpSettings) then try to scroll to the named v-jump if it exists
*
* @param {Object|string} options Either an options object or the value of `options.name`
* @param {string} options.name The name of the jump item - must be unique within a page
* @param {boolean} [options.smooth=true] Use smooth scrolling when jumping, can also be disabled with the 'nosmooth' modifier
* @param {boolean} [options.remove=false] Remove the hash component from the URL after navigating, can also be specified as `remove` modifier
* @param {boolean} [options.flash=true] Try to animate the target element (post scrolling) if it has the flashClassFilter CSS class, can also be disabled with the 'noflash' modifier
* @param {string} [options.flashClass='v-jump-flash'] CSS class to add to the target if `flash` is enabled
* @param {array<string>} [options.flashClassFilter=['card']] CSSes class to check for before applying `flash` behaviour
* @param {string} [options.flashDelay=500] Interval in milliseconds before adding the `flashClass` CSS class
* @param {string} [options.flashInterval=1500] Interval in milliseconds before removing the `flashClass` CSS class
*/
app.directive('v-jump', {
	bind(el, binding) {
		var settings = {
			name: undefined,
			smooth: true,
			remove: false,
			flash: true,
			flashClass: 'v-jump-flash',
			flashClassFilter: ['card'],
			flashDelay: 500,
			flashInterval: 1500, //= 1.5s
			settled: true,
			...(typeof binding.value == 'string' ? {name: binding.value} : binding.value),
			...(binding.modifiers.nosmooth ? {smooth: false} : {}),
			...(binding.modifiers.remove ? {remove: true} : {}),
			...(binding.modifiers.noflash ? {flash: false} : {}),
		};
		if (name.startsWith('#')) throw new Error('v-jump names cannot begin with hash');

		// Register jump + settings
		jumps[settings.name] = {el, ...settings};
	},

	unbind(el, binding) {
		var name = typeof binding.value == 'string' ? binding.value : binding.value.name;
		delete jumps[name];
	},
});


// When app is ready...
app.ready.then(()=> {

	// Register router hook
	var routerHook = (to, from, next) => {
		if (!to.hash || to.hash == '#') return next(); // No hash given - continue on anyway

		var hash = to.hash.replace(/^#/, '');
		var tryJumpCount = 0;
		var tryJump = ()=> {
			debug('Attempting to jump to', hash, 'try', tryJumpCount, '/', jumpSettings.tryMaximum);
			var jump = jumps[hash];
			if (jump) { // Jump exists - jump to it
				Promise.resolve()
					.then(()=> jump.settled && app.settled()) // Wait for page settle first?
					.then(()=> {
						debug('jump', hash, 'found, jumping');
						jump.el.scrollIntoView(jump.smooth ? {behavior: 'smooth'} : undefined);

						// Optional removal of the URL component
						if (jump.remove) {
							debug('removing hash', hash, 'from url');
							app.router.replace({hash: undefined});
						}

						// Add optional flash class
						if (jump.flash) {
							debug('adding flash class');
							var elClasses = new Set(jump.el.classList);
							if (jump.flashClassFilter.some(fc => elClasses.has(fc))) {
								setTimeout(()=> {
									jump.el.classList.add(jump.flashClass);

									if (jump.flashInterval > 0)
										setTimeout(()=> jump.el.classList.remove(jump.flashClass), jump.flashInterval);
								}, jump.flashDelay);
							} else {
								debug('v-jump target does not have any flashClassFilter selectors:', jump.flashClassFilter, '- skipping flash');
							}
						}
					});
			} else if (tryJumpCount++ < jumpSettings.tryMaximum) { // Still below limit
				app.vue.$nextTick(()=> setTimeout(tryJump, jumpSettings.tryInterval));
			} else {
				debug('jump', hash, 'still not found after', tryJumpCount  * jumpSettings.tryMaximum + 'ms', '- giving up');
			}
		};

		tryJump() // Start in background
		next(); // Continue on with navigation
	};
	app.router.beforeEach(routerHook);

	// Throw dummy hook immediately when app loads to fix issue with vue-router not firing the initial beforeEach()
	app.vue.$nextTick(()=> {
		routerHook({hash: window.location.hash}, null, ()=> {});
	});
});
</script>

<style lang="scss">
.v-jump-flash {
	@keyframes v-jump-flash-blink {
		50% { opacity: 0 }
		100% { opacity: 1 }
	}

	/* BS4 style cards {{{ */
	&.card {
		animation: v-jump-flash-blink 0.5s linear 4;
	}
	/* }}} */
}
</style>
