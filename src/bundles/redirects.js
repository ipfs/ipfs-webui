import { createSelector } from 'redux-bundler'
import { MFS_PATH } from './files'

export default {
  name: 'redirects',

  reactToEmptyHash: createSelector(
    'selectHash',
    (hash) => {
      if (hash === '') {
        return { actionCreator: 'doUpdateHash', args: ['#/'] }
      }
    }
  ),

  reactToEmptyFiles: createSelector(
    'selectHash',
    'selectFilesPathFromHash',
    (hash, path) => {
      if (hash === '/files' || hash === '/files/' || (path && (path === '' || path === '/ipns'))) {
        return { actionCreator: 'doUpdateHash', args: [`#/files${MFS_PATH}/`] }
      }
    }
  ),

  reactToIpfsConnectionFail: createSelector(
    'selectIpfsInitFailed',
    'selectHash',
    (failed, hash) => {
      if (failed && hash !== '/welcome' && !hash.startsWith('/settings')) {
        return { actionCreator: 'doUpdateHash', args: ['#/welcome'] }
      }
    }
  )
}
