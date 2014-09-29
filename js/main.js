var React = require('react')
var App = require('./app.jsx')

// jquery entry point.
$(document).ready(function() {
  var appEl = document.getElementById('webui-app')
  React.renderComponent(App(), appEl)
})
