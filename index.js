var path = require('path')
var express = require('express')
var ipfs_static = require('ipfs-node-server-static')('localhost', 5001, {api: true})

var port = process.env.PORT || 8010

/**
 * Serves the application and proxies to the API using ipfs-node-server-static.
 */

var app = express()

app.get('(/)?', function (req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, 'static', 'html')})
})

app.get('/bundle.js', function (req, res) {
  res.sendFile('bundle.js', {root: path.join(__dirname, 'build')})
})

app.use(ipfs_static)
app.use(express.static(require('path').join(__dirname, 'build')))
app.use('/static', express.static(require('path').join(__dirname, 'static')))

app.listen(port, function () {
  console.log('Static server listening on port', port)
})
