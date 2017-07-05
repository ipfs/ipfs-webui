// note: it has to be undefined and not false because of hjs-dev-server
const isDev = undefined
const makeConfig = require('./make-config')

module.exports = makeConfig(isDev)
