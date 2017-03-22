// Broken because of https://phabricator.babeljs.io/T2877
// export * from './pages'
// export * from './errors'

// export * from './home'
// export * from './peers'
// export * from './files'
// export * from './preview'
// export * from './logs'

// Workaround

import * as pages from './pages'
import * as errors from './errors'
import * as router from './router'

import * as files from './files'
import * as preview from './preview'
import * as config from './config'

export {pages}
export {errors}
export {router}
export {files}
export {preview}
export {config}
