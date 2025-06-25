var autopsy = {};
module.exports = autopsy;

/**
* Attempts to identify a function's characteristics
* @param {function} fn The function to examine
* @returns {string} The function type, ENUM: 'async', 'cb', 'plain'
*/
autopsy.identify = fn => {
	var fnString = fn.toString();

	var bits, fnArgs;
	if (/^async /.test(fnString)) { // async (...)=> | async function(...)
		return 'async'; // Its an async function and should only ever return a promise
	} else if (bits = /^function\s*(?:.*?)\s*\((.*?)\)/.exec(fnString)) { // function(stuff)
		fnArgs = bits[1];
	} else if (/^\(\s*\)\s*=>/.test(fnString)) {
		return 'plain';
	} else if (bits = /^\s\((.*?)\)\s*?=>/.exec(fnString)) {
		fnArgs = bits[1];
	} else if (bits = /^(.*?)\s*=>/.exec(fnString)) {
		fnArgs = bits[1];
	} else {
		return 'plain';
	}

	fnArgs = fnArgs.replace(/^\s+/, '').replace(/\s+$/, ''); // Clean up args by trimming whitespace

	return (fnArgs ? 'cb' : 'plain');
};


/**
* Return whether a function has what looks like a callback
* This is really just a convenience wrapper around `autopsy.identify`
* @param {function} fn The function to examine
* @returns {boolean} whether to function MAY have a callback
*/
autopsy.hasCallback = fn => autopsy.identify(fn) == 'cb';
