var commander = require('commander');

// Imports from main modulea {{{
function pad(str, width) {
	var len = Math.max(0, width - str.length);
	return str + Array(len + 1).join(' ');
}
// }}}

// .env() {{{
commander.Command.prototype._envs = [];
commander.Command.prototype.env = function(name, desc) {
	if (typeof this._envs === 'undefined') this._envs = [];
	this._envs.push([name, desc]);
	return this;
};
// }}}

// .example() {{{
commander.Command.prototype._examples = [];
commander.Command.prototype.example = function(eg, title) {
	if (typeof this._examples === 'undefined') this._examples = [];
	this._examples.push([eg, title]);
	return this;
};
// }}}

// .note() {{{
commander.Command.prototype._notes = [];
commander.Command.prototype.note = function(note) {
	if (typeof this._notes === 'undefined') this._notes = [];
	this._notes.push(note);
	return this;
};
// }}}

// Extend existing help {{{
commander.Command.prototype.helpInformationOriginal = commander.Command.prototype.helpInformation;
commander.Command.prototype.helpInformation = function() {
	var help = '';

	var width = this.padWidth ? this.padWidth() : 0; // Determine padding for older Commander versions or just assume zero
	help += this.helpInformationOriginal();

	// Env
	if (this._envs.length) {
		help += '\nEnvironment variables:\n';
		this._envs.forEach(e => {
			help += `  ${pad(e[0], width)}  ${e[1]}\n`;
		});
	}

	// Notes
	if (this._notes.length) {
		help += '\nNotes:\n';
		this._notes.forEach(note => {
			help += `  * ${note}\n`
		});
	}

	// Examples
	if (this._examples.length) {
		help += '\nExamples:\n';
		this._examples.forEach(eg => {
			if (eg[1]) help += `\n  # ${eg[1]}\n`;
			help += '  ' + eg[0] + '\n'
		});
	}

	return help;
};
// }}}

// Extenter / injector function {{{
module.exports = function(commandInst) {
	if (commandInst === undefined) {
		commandInst = new commander.Command();
	} else if (!commandInst instanceof commander.Command) {
		throw new Error('Single argument to commander-extras must be a commander.Command instance');
	}

	// TODO: Loop/map own properties and define each?
	Object.defineProperties(commandInst, {
		env: {
			value: commander.Command.prototype.env,
		},
		example: {
			value: commander.Command.prototype.example,
		},
		note: {
			value: commander.Command.prototype.note,
		},
	});

	return commandInst;
};
// }}}
