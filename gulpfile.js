// ./node_modules/gulp/bin/gulp.js bundle_bower_js
gulp = require('gulp');
bower = require('main-bower-files');
concat = require('gulp-concat');
filter = require('gulp-filter');

gulp.task('bundle_bower_js', function() {
  var jsFilter = filter('**/*.js');
  gulp
    .src(bower())
    .pipe(jsFilter)
    .pipe(concat('bower_components.js'))
    .pipe(gulp.dest('libs/'));
});
