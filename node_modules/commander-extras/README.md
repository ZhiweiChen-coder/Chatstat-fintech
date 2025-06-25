Commander-Extras
================
Extremely small utility which adds additional functionality to the [Commander](https://github.com/tj/commander.js) NPM module.


```javascript
// Using the global prototype mutate method
var commander = require('commander');
require('commander-extras');

var program = commander.option('-v, --verbose', 'Be verbose')
	.env('FOO', 'FOO Environment variable desription')
	.env('BAR', 'BAR Environment variable desription')
	.env('BAZ', 'FOO environment variable desription')
	.note('Note one')
	.note('Note two')
	.note('Note three')
	.parse(process.argv)
	.opts()
```

```javascript
// Using the global prototype mutate method
var Commander = require('commander');
var commanderExtras = require('commander-extras');

var command = new Commander.Command();
var commander = commanderExtras(command); // Mutate only our custom command

var program = commander.option('-v, --verbose', 'Be verbose')
	.env('FOO', 'FOO Environment variable desription')
	.env('BAR', 'BAR Environment variable desription')
	.env('BAZ', 'FOO environment variable desription')
	.note('Note one')
	.note('Note two')
	.note('Note three')
	.parse(process.argv)
	.opts()
```


API
===
The following API's are added to the existing Commander prototype:

CommanderExtras(Command?)
-------------------------
Take an optional `Commander.Command` instance and add the custom methods to it.


env(name, description)
----------------------
Used to define an environment variable.


example(cli, title)
----------------------
Used to define an example with an optional title.


note(description)
-----------------
Add an additional note to display at the bottom of the help output.
