// import Router from 'react-router'

export default function linkHandler () {
  var external = /^(https?:)?\/\//i
  var staticLink = /^\/static\//i

  document.body.getElementByTagName('a').onclick = function (event) {
    var href = this.getAttribute('href')
    console.log(href)

    // pass through if external or static
    if (external.test(href) || staticLink.test(href)) return

    // bail if already defaultPrevented
    if (event.defaultPrevented) return

    event.preventDefault()
    return false
  }
}
