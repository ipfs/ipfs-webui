import _ from 'lodash'
import debug from 'debug'

const log = debug('utils:localStorage')
const warn = debug('utils:localStorage:warn')

// Utility to make interacting with localstorage less painful.
const ls = process.browser && window.localStorage

// LS API is obnoxious this way
const translations = {
  get: 'getItem',
  set: 'setItem',
  remove: 'removeItem'
}
const operations = ['getItem', 'setItem', 'clear', 'removeItem'].concat(_.keys(translations))

_.each(operations, op => module.exports[op] = () => doOperation(translations[op] || op))

const doOperation = op => {
  if (!ls) {
    return
  }
  const args = _.toArray(arguments).slice(1)

  // Allow setting objects directly
  if (op === 'setItem' && args[1] !== 'string') {
    args[1] = JSON.stringify(args[1])
  }
  try {
    let result = ls[op].apply(ls, args)
    // If getting, attempt to parse
    if (op === 'getItem') {
      try {
        result = JSON.parse(result)
      } catch (e) {
        log('Unable to parse result as json. Message: %s', e.message)
      }
    }
    return result
  } catch (e) {
    warn(e.message)
  }
}
