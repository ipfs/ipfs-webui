'use strict'
// These use style-loader so they will create <style> tags in the DOM
require('font-awesome-webpack')
require('node_modules/bootstrap/dist/css/bootstrap.min.css')
require('less/bundle.less')
require('static/css/style.css')

// Regular includes
var React = require('react')
var Router = require('react-router')
var routes = require('./app.jsx')
var $ = require('jquery')

// var linkHandler = require('./linkhandler.js')
if (process.env.NODE_ENV !== 'production') {
  window.uiDebug = require('debug')
}

// jquery entry point.
$(document).ready(function () {
  var appEl = document.getElementById('webui-app')
  Router.run(routes, function (Handler) {
    React.render(<Handler />, appEl)
  })
})
