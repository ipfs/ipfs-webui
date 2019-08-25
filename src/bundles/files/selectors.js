import { createSelector } from 'redux-bundler'
import { ACTIONS } from './consts'
import { infoFromPath } from './utils'

export default () => ({
  selectFiles: (state) => state.files.pageContent,

  selectPins: (state) => state.files.pins,

  selectFilesSize: (state) => state.files.mfsSize,

  selectFilesIsFetching: (state) => state.files.pending.some(a => a.type === ACTIONS.FETCH),

  selectShowLoadingAnimation: (state) => {
    const pending = state.files.pending.find(a => a.type === ACTIONS.FETCH)
    return pending ? (Date.now() - pending.start) > 1000 : false
  },

  selectFilesSorting: (state) => state.files.sorting,

  selectWriteFilesProgress: (state) => {
    const writes = state.files.pending.filter(s => s.type === ACTIONS.WRITE && s.data.progress)

    if (writes.length === 0) {
      return null
    }

    const sum = writes.reduce((acc, s) => s.data.progress + acc, 0)
    return sum / writes.length
  },

  selectFilesHasError: (state) => state.files.failed.length > 0,

  selectFilesErrors: (state) => state.files.failed,

  selectFilesPathInfo: createSelector(
    'selectRouteInfo',
    (routeInfo) => {
      return infoFromPath(routeInfo.url)
    }
  )
})
