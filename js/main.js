var React = require('react')
var Page = require('./views/page.jsx')
var home = require('./pages/home.jsx')
var peers = require('./pages/peers.jsx')

// jquery entry point.
$(document).ready(function() {
  var content = home
  React.renderComponent(Page({}, content), document.getElementById('page'))
})
