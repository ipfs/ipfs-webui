var gulp = require('gulp')
var g_if = require('gulp-if')
var react = require('gulp-react')
var less = require('gulp-less')
var cssmin = require('gulp-cssmin')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var imagemin = require('gulp-imagemin')
var sourcemaps = require('gulp-sourcemaps')
var connect = require('gulp-connect')
var rename = require('gulp-rename')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
var reactify = require('reactify')
var del = require('del')
var NwBuilder = require('node-webkit-builder')

var paths = {
  build: 'build/',
  main: ['./js/main.js'],
  js: ['js/**/*.js', 'js/**/*.jsx'],
  img: ['static/**/*.png'],
  css: ['less/**/*.less'],
  html: ['html/**/*.html'],
}

gulp.task('clean', function(cb) {
  del([paths.build], cb)
})

gulp.task('js', function() {
  return browserify(paths.main)
    .transform(reactify)
    .bundle()
    .pipe(source('bundle.min.js'))
    // .pipe(sourcemaps.init())
    // .pipe(g_if('*.jsx', react()))
    // .pipe(uglify())
    // .pipe(concat('bundle.min.js'))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/static'))
})

gulp.task('css', function() {
  return gulp.src(paths.css)
    .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(cssmin())
      .pipe(concat('bundle.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/static'))
})

gulp.task('img', function() {
  return gulp.src(paths.img)
    //.pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/static'))
    .pipe(connect.reload())
})

gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest('build/'))
})

gulp.task('compile', ['js', 'css', 'img', 'html'])

gulp.task('watch', function() {
  gulp.watch(paths.js, ['js'])
  gulp.watch(paths.css, ['css'])
  gulp.watch(paths.img, ['img'])
  gulp.watch(paths.html, ['html'])
})

gulp.task('server', function() {
  connect.server({
    root: 'build',
    fallback: 'build/index.html',
    port: 8000,
    livereload: true
  })
})

gulp.task('build', ['compile'], function() {
  var stream = gulp.src('nw-package.json')
    .pipe(rename('package.json'))
    .pipe(gulp.dest('build'))

  stream.on('end', function() {
    var nw = new NwBuilder({
      files: ['build/**', '!build/ipfs-webui/**'],
      platforms: ['osx', 'win', 'linux32', 'linux64']
    })
    nw.build(function(err) {
      if(err) console.error(err)
    })
  }) 
})

gulp.task('default', ['watch', 'compile', 'server'])
