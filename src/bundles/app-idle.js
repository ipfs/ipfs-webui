// Extracted from https://github.com/HenrikJoreteg/redux-bundler/blob/c1b8ce7629ee6c389f4155b3254e530bd09c868e/src/bundles/create-reactor-bundle.js
import { debounce, ric, raf } from 'redux-bundler'

const defaults = {
  idleTimeout: 2000,
  idleAction: 'APP_IDLE',
  stopWhenTabInactive: false
}

const ricOptions = { timeout: 500 }

export const getIdleDispatcher = (stopWhenInactive, timeout, fn) =>
  debounce(() => {
    // the requestAnimationFrame ensures it doesn't run when tab isn't active
    stopWhenInactive ? raf(() => ric(fn, ricOptions)) : ric(fn, ricOptions)
  }, timeout)

const createAppIdle = spec => ({
  name: 'appIdle',

  init: store => {
    const opts = Object.assign({}, defaults, spec)
    const { idleAction, idleTimeout } = opts
    let idleDispatcher
    if (idleTimeout) {
      idleDispatcher = getIdleDispatcher(
        opts.stopWhenTabInactive,
        idleTimeout,
        () => store.dispatch({ type: idleAction })
      )
    }

    const callback = () => {
      if (idleDispatcher) {
        idleDispatcher()
      }
    }

    store.subscribe(callback)
    callback()
  }
})
export default createAppIdle
