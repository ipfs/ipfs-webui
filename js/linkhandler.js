var Router = require('react-router')

function linkHandler()  {

  var external = /^(https?:)?\/\//i
  var static = /^\/static\//i

  $(document.body).on('click', 'a', function(event) {

    var href = $(this).attr('href')
    console.log(href)

    // pass through if external or static
    if (external.test(href) || static.test(href))
      return

    // bail if already defaultPrevented
    if (event.defaultPrevented)
      return

    Router.transitionTo(href)
    event.preventDefault()
    event.stopPropagation()
    return false
  });
}

module.exports = linkHandler
