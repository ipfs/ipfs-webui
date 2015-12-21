'use strict'
// var Router = require('react-router')
var $ = require('jquery')

function linkHandler () {
  var external = /^(https?:)?\/\//i
  var staticLink = /^\/static\//i

  $(document.body).on('click', 'a', function (event) {
    var href = $(this).attr('href')
    console.log(href)

    // pass through if external or static
    if (external.test(href) || staticLink.test(href)) return

    // bail if already defaultPrevented
    if (event.defaultPrevented) return

    event.preventDefault()
    return false
  })
}

module.exports = linkHandler
