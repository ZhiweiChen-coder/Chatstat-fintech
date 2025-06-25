/**
* Various debug helpers
*/
const gulp = require('gulp');

gulp.task('app.config', 'load:app', ()=> {
	console.dump(app.config);
});
