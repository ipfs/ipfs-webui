'use strict'
var _ = require('lodash')

// Utility to make interacting with localstorage less painful.
var ls = process.browser && window.localStorage

// LS API is obnoxious this way
var translations = {
  get: 'getItem',
  set: 'setItem',
  remove: 'removeItem'
}
var operations = ['getItem', 'setItem', 'clear', 'removeItem'].concat(_.keys(translations))

_.each(operations, function (op) {
  var opName = translations[op] || op
  module.exports[op] = doOperation.bind(null, opName)
})

function doOperation (op) {
  if (!ls) return
  var args = _.toArray(arguments).slice(1)
  // Allow setting objects directly
  if (op === 'setItem' && args[1] !== 'string') {
    args[1] = JSON.stringify(args[1])
  }

  try {
    var result = ls[op].apply(ls, args)
    // If getting, attempt to parse
    if (op === 'getItem') {
      try {
        result = JSON.parse(result)
      } catch(e) {}
    }

    return result
  } catch(e) {
    console.warn('LocalStorage error: ' + e.message)
  }
}
