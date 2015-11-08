'use strict'

var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var routes = require('./app.jsx')

// var linkHandler = require('./linkhandler.js')
if (process.env.NODE_ENV !== 'production') {
  window.uiDebug = require('debug')
}

document.addEventListener('DOMContentLoaded', function () {
  Router.run(routes, function (Handler) {
    ReactDOM.render(<Handler />, document.getElementById('webui-app'))
  })
})
