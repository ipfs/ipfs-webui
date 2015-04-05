var superagent = require('superagent')
var express = require('express')
var WebpackDevServer = require('webpack-dev-server')
var webpack = require('webpack')
var ipfs_static = require('ipfs-node-server-static')('localhost', 5001, {api: true})

var port = process.env.PORT || 8010
var webpackPort = port + 1
// require('openurl').open('http://localhost:' + port)

var app = express()

app.get('(/)?', function (req, res) {
  res.sendFile('index-dev.html', {root: __dirname})
})

app.get('/bundle.js', function (req, res) {
  superagent.get('http://localhost:' + webpackPort + '/bundle.js').pipe(res)
})

app.use(ipfs_static)
app.use(express.static(require('path').join(__dirname, 'dist')))
app.use('/static', express.static(require('path').join(__dirname, 'static')))

app.listen(port, function () {
  console.log('Static server listening on port', port)
})

// Create webpack-dev-server on port + 1 (usually 8011)
console.log('compiling...')
var compiler = webpack(require('./webpack-dev-server.config.js'))
var server = new WebpackDevServer(compiler)
server.listen(webpackPort, 'localhost', function () {
  console.log('Webpack Dev Server listening on port', webpackPort)
})
