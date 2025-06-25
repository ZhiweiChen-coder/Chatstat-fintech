let fs = require('fs')
let fsPath = require('path');

/**
* Attempt to rename a file if its on the same device OR move it if not
*
* @param {string} src Source path to move from
* @param {string} dst Destination path to move to
* @param {Object} [options] Additional options to configure behaviour
* @param {boolean} [options.mkdir=true] Create destination directories before moving
* @returns {Promise<string>} A promise which will resolve with the destination path when the file has been moved
*/
fs.promises.move = (src, dst, options) => {
	let settings = {
		mkdir: true,
		...options,
	};

	return Promise.resolve()
		.then(()=> settings.mkdir && fs.promises.mkdir(fsPath.dirname(dst), {recursive: true}))
		.then(()=> fs.promises.rename(src, dst).catch(e => { // Try a simple rename first
			if (e.code != 'EXDEV') throw e; // Not a "not the same device" error - throw it and die

			return Promise.resolve()
				.then(()=> new Promise((resolve, reject) => { // Create a copy + unlink the original
					var readStream = fs.createReadStream(src);
					var writeStream = fs.createWriteStream(dst);

					readStream.on('error', reject);
					writeStream.on('error', reject);

					writeStream.on('finish', ()=> resolve());

					readStream.pipe(writeStream);
				}))
				.then(()=> fs.promises.unlink(src))
				.then(()=> dst)
		}))
};
