var Router = require('react-router')
module.exports = linkHandler

function linkHandler()  {

  var external = /^(https?:)?\/\//i
  var static = /^\/static\//i

  $(document.body).on('click', 'a', function(event) {

    var href = $(this).attr('href')

    // pass through if external or static
    if (external.test(href) || static.test(href))
      return

    // bail if already defaultPrevented
    if (event.defaultPrevented)
      return

    Router.transitionTo(href)
    event.preventDefault()
    return false
  });
}
