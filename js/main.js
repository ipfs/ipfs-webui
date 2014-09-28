var React = require('react')
var home = require('./pages/home.jsx')

// jquery entry point.
$(document).ready(function() {
  React.renderComponent(home, document.getElementById('page'))
})
