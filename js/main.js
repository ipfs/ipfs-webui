var React = require('react')
var Router = require('react-router')
var routes = require('./app.jsx')
var linkHandler = require('./linkhandler.js')

// jquery entry point.
$(document).ready(function() {
  var appEl = document.getElementById('webui-app')
  Router.run(routes, Router.HistoryLocation, function(Handler) {
    React.render(Handler(), appEl)
  })
})
