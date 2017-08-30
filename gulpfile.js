'use strict';

const gulp = require('gulp');

function loadTask(fileName, taskName) {
  const taskModule = require('./tools/gulp-tasks' + fileName);
  const task = taskName ? taskModule[taskName] : taskModule;
  return task(gulp);
}

gulp.task('format:enforce', loadTask('format', 'enforce'));
gulp.task('format', loadTask('format', 'format'));
