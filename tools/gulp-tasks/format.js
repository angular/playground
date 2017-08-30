const srcsToFmt = [
  'src/**/*.{js,ts}',
  'assets/compiler/**/*.{js.ts}',
  'assets/fs/**/*.{js.ts}',
  'assets/sharing/**/*.{js.ts}',
  'test/**/*.{js.ts}',
]

module.exports = {
  // Check source code for formatting errors (clang-format)
  enforce: (gulp) => () => {
    const format = require('gulp-clang-format');
    const clangFormat = require('clang-format');
    return gulp.src(srcsToFmt).pipe(
        format.checkFormat('file', clangFormat, {verbose: true, fail: true}));
  },

  // Format the source code with clang-format (see .clang-format)
  format: (gulp) => () => {
    const format = require('gulp-clang-format');
    const clangFormat = require('clang-format');
    return gulp.src(srcsToFmt, {base: '.'})
        .pipe(format.format('file', clangFormat))
        .pipe(gulp.dest('.'));
  }
}
