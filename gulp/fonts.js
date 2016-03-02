module.exports = function(gulp, plugins) {
  return function () {
    return gulp.src([
      './bower_components/bootstrap/fonts/*.*',
      './bower_components/font-awesome/fonts/*.*'
    ])
    .pipe(gulp.dest('.tmp/serve/fonts'))
    .pipe(gulp.dest('dist/fonts'));
  };
};
