var React = require('react')
var page = require('./views/page.jsx')


// jquery entry point.
$(document).ready(function() {
  var id = document.getElementById('page')
  React.renderComponent(page, id)
})
