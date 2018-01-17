import Noty from 'noty'

import '../../node_modules/noty/lib/noty.css'
import '../../node_modules/noty/lib/themes/mint.css'

const defaults = {
  type: 'info',
  layout: 'topRight',
  timeout: 1000,
  progressBar: true
}

export function trigger (opts) {
  new Noty(Object.assign({}, defaults, opts)).show()
}

export function success (message) {
  new Noty(Object.assign({}, defaults, {
    text: message,
    type: 'success'
  })).show()
}

export function error (error) {
  let n = new Noty(Object.assign({}, defaults, {
    text: error,
    type: 'error',
    timeout: null,
    buttons: [
      Noty.button('Report Issue', '', function () {
        window.open('https://github.com/ipfs-shipyard/ipfs-webui/issues/new')
      }),
      Noty.button('Close', '', function () {
        n.close()
      })
    ]
  }))

  n.show()
}
