/* global require, process */
'use strict'

var bygg = require('bygg')

var browserify = require('bygg-plugins-light/browserify')
var less = require('bygg-plugins-light/less')
var serve = require('bygg-plugins-light/serve')
var stats = require('bygg-plugins-light/stats')
var rename = require('bygg-plugins-light/rename')
var proxy = require('proxy-middleware')
var url = require('url')

bygg.task('serve', function () {
  return build()
    .pipe(bygg.write('build/'))
    .pipe(serve(3000, function (app) {
      var opts = url.parse('http://localhost:5001/api')
      opts.headers = {'referer': 'http://localhost:5001/'}
      return app
        .use('/api', proxy(opts))
    }))
})

bygg.task('build', function () {
  return build()
    .pipe(bygg.write('build/'))
    .pipe(stats())
})

var build = function (optimize) {
  var html = bygg
    .files('html/index.html')
    .pipe(rename('html/index.html', 'index.html'))

  var assets = bygg
    .files('static/*/*')

  var styles = bygg
    .files('less/bundle.less')
    .pipe(less())
    .pipe(rename('less/bundle.css', 'style.css'))

  var scripts = bygg
    .files('js/main.jsx')
    .pipe(browserify({
      dest: 'bundle.js',
      extensions: ['.js', '.jsx'],
      configure: function (b) {
        b.transform('6to5ify')
      }
    }))
    .pipe(rename('js/main.js', 'bundle.js'))

  return bygg.combine(
    html,
    assets,
    styles,
    scripts
  )
}
