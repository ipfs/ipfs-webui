// Broken because of https://phabricator.babeljs.io/T2877
// export * from './pages'
// export * from './errors'
// export * from './router'

// export * from './home'
// export * from './peers'
// export * from './files'
// export * from './logs'

// Workaround

import * as pages from './pages'
import * as errors from './errors'
import * as router from './router'

import * as home from './home'
import * as peers from './peers'
import * as files from './files'
import * as logs from './logs'
import * as config from './config'

export {
  pages,
  errors,
  router,

  home,
  peers,
  files,
  logs,
  config
}
