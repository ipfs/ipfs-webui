export function waitForElement (selector) {
  return new Promise((resolve, reject) => {
    var element = document.querySelector(selector)

    if (element) {
      resolve(element)
      return
    }

    var observer = new window.MutationObserver((mutations) => {
      var element = document.querySelector(selector)

      if (element) {
        resolve(element)
      }
    })

    observer.observe(document.documentElement, { childList: true, subtree: true })
  })
}
