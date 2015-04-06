'use strict'
var http = require('http')
var path = require('path')
var express = require('express')
var WebpackDevServer = require('webpack-dev-server')
var webpack = require('webpack')
var ipfs_static = require('ipfs-node-server-static')('localhost', 5001, {api: true})

/**
 * This is the same as `app.js`, but also runs a webpack dev server alongside and
 * proxies to it. This allows us to get hot reload.
 */

var port = process.env.PORT || 8010
var webpackPort = port + 1
var webpackURL = 'http://localhost:' + webpackPort
require('openurl').open('http://localhost:' + port)

var app = express()

app.get('(/)?', function (req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, 'static', 'html')})
})

// proxy the bundle
app.get('/bundle.js', function (req, res) {
  http.get(webpackURL + req.url, function (resp) {
    resp.pipe(res)
  })
})

app.use(ipfs_static)
app.use(express.static(require('path').join(__dirname, 'build')))
app.use('/static', express.static(require('path').join(__dirname, 'static')))

var server = app.listen(port, function () {
  console.log('Static server listening on port', port)
})

// Create webpack-dev-server on port + 1 (usually 8011)
var compiler = webpack(require('./webpack-dev-server.config.js'))
var server = new WebpackDevServer(compiler)
server.listen(webpackPort, 'localhost', function () {
  console.log('Webpack Dev Server listening on port', webpackPort)
})
