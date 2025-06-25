var _ = require('lodash');
var debug = require('debug')('emt:main');
var Throttle = require('@momsfriendlydevco/throttle');
//var timestring = require('timestring');

/**
* Returns a middleware layer which will throttle a request, optionally dropping leading/tailing requests that come in while an existing request is in progress
* This module is cross-process safe as it uses the cache/locking modules
*
* NOTE: Currently this middleware does not hang onto the response and re-report it after locking but before the timeout has expired - use app.middleware.cache for that functionality
*
* @param {Object|string|number|function} [options] Options to pass to the middleware, if a non-object is provided its assumed to be the value of `options.wait`
* @param {function} [options.hash] Promisable function return, called as `(req, res)` used to hash the request, defaults to simply hashing `{path: req.path, query: req.query, params: req.params}`, uses app.lock.hash to hash objects or can return a unique ID/string identifier
* @param {function} [options.onLocked] Function called to run if the incomming request is locked (in progress), can call res.send() etc. to close the request
* @param {function} [options.onUnlocked] Function called to run if the incomming request is not locked (able to be executed immediately), can call next() etc. to pass the request on to following middleware
* @param {function|number} [options.wait='10s'] Promiseable function return, called as `(req, res)` and expected to provide a timestring parsable time to declare the function as working, we wait this amount of time AFTER resolving the output before declaring the function 'unlocked' again
* @param {boolean} [options.leading=true] Drop any requests that come in while an existing request is in progress
*
* @example Throttle an endpoint so multiple people hitting it all get the same random number for 30s
* app.get('/api/randomNumber', app.middleware.express.throttle('10s'), (req, res) => res.send({random: _.random(0, 9999))});
*
* @example Throttle a long running process so only one "worker" can execute at once, others simply return 420
* app.get('/api/longProcess', app.middleware.express.throttle({response: (req, res) => res.sendStatus(420)}), (req, res) => {
*   someLongRunningPromise.then(output => res.send(output))
* });
*/
var middleware = function(options) {
	var settings = {
		// TODO: Interprete time strings
		wait: 10000,
		..._.isPlainObject(options) ? options : {},
	};
	debug('settings', settings);

	var throttler = new Throttle(settings);
	throttler.init();

	return (req, res, next) => throttler.throttle(
		// Worker
		() => {
			return new Promise((resolve, reject) => {
				debug('onUnlocked');
				var oldResEnd = res.end; // Replace res.end with our own handler
				res.end = (...args) => {
					oldResEnd(...args); // Let Express handle the usual end output

					setTimeout(()=> { // Cue up timer to execute after wait
						resolve();
					}, settings.wait);
				};

				// Call next item in middleware which (should) eventually call res.end() which gets duck-typed above
				next();
			});
		}, {
			// TODO: Name throttle id by some request attribute?
			id: 'middleware',
			hash: ({path: req.path, query: req.query, params: req.params}),
		})
		.catch(() => {
			debug('onLocked');
			// FIXME: sendStatus is bespoke and not express core?
			// FIXME: Send "Too many connections" instead?
			res.sendStatus(200);
		});
};

module.exports = middleware;
