import { createSelector } from 'redux-bundler'

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
    (hash) => {
      if (hash === '/files') {
        return { actionCreator: 'doUpdateHash', args: ['#/files/'] }
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
