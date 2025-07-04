/**
* This is used to boostrap agents when running from CLI.
* @example Use the agentLoader process and generate a sitemap
* AGENT_PRELOAD=agents/agentLoader.js ./run-agents -d assets
*/

//var crash = require('@momsfriendlydevco/crash');
var colors = require('colors');
var debug = require('debug')('doop:agentLoader');
var globby = require('globby');

process.env.DOOP_IGNORE_CMD_ARGS = 1; // Stop Doop config loader accepting this programs command line arguments

module.exports = session => session
	//.on('start', (session, agents) => console.log('start', Object.keys(agents._agents)))
	//.on('preInit', (session, agents) => console.log('preInit', Object.keys(agents._agents)))
	//.on('preRun', (session, agents) => console.log('preRun', Object.keys(agents._agents)))
	//.on('end', (session, agents) => console.log('end', Object.keys(agents._agents)))

	.on('start', (session, agents) => 
		Promise.resolve()
			// Load app core {{{
			.then(()=> {
				debug('Loading application core: Agents');
				require('../app/app.backend');
			})
			// }}}
			// Initialize all .doop files {{{
			// TODO: Do we require vendor *.doop files for Agents?
			.then(()=> app.setup())
			// Disabling HMR for agents, otherwise they keep compiling beyond what is required
			// FIXME: Is this indicative of a promise bug in HMR middleware?
			.then(()=> app.config.hmr.enabled = false)
			// }}}
			// Emit events to boot server in order {{{
			.then(()=> app.emit('preInit'))
			.then(()=> app.emit('init'))
			.then(()=> app.emit('postInit'))
			.then(()=> app.emit('preMiddleware'))
			.then(()=> app.emit('middleware'))
			.then(()=> app.emit('postMiddleware'))
			.then(()=> app.emit('preSchemas'))
			.then(()=> app.emit('schemas'))
			.then(()=> app.emit('postSchemas'))
			.then(()=> app.emit('preAgents'))
			.then(()=> app.emit('agents'))
			.then(()=> app.emit('postAgents'))
			//.then(()=> app.emit('preEndpoints'))
			//.then(()=> app.emit('endpoints'))
			//.then(()=> app.emit('postEndpoints'))
			//.then(()=> app.emit('preServer'))
			//.then(()=> app.emit('server'))
			//.then(()=> app.emit('postServer'))
			//.then(()=> app.emit('preReady'))
			.then(()=> app.log(app.log.colors.bold.blue('⚝  Doop! ⚝')))
			//.then(()=> app.emit('ready'))
			// }}}
			// Error handling {{{
			//.catch(e => crash.stop(e, {prefix: 'Fatal server process exit'}))
			// }}}
			.then(()=> {
				agents
					.on('refreshWarn', (path, msg) => console.log(colors.yellow('WARNING'), msg, colors.grey(`@ ${path}`)))
					.on('log', (session, ...args) => console.log.apply(this, args))
					.on('warn', (session, ...args) => console.log.apply(this, [colors.yellow('WARNING')].concat(args)))
			})
	)
	.on('preInit', (session, agents) => {
		return agents.set(app.config.agents);
	})
	.on('end', ()=> app.emit('exit'));
