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
    (failed) => {
      if (failed) {
        return { actionCreator: 'doUpdateHash', args: ['#/welcome'] }
      }
    }
  )
}
