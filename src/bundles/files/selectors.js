import { createSelector } from 'redux-bundler'
import { ACTIONS, MFS_PATH } from './consts'

export default (opts) => ({
  selectFiles: (state) => state.files.pageContent,

  selectPins: (state) => state.files.pins,

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

  selectFilesPathFromHash: createSelector(
    'selectRouteInfo',
    (routeInfo) => {
      if (!routeInfo.url.startsWith(opts.baseUrl)) return
      if (!routeInfo.params.path) return
      let path = routeInfo.params.path

      if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1)
      }

      return decodeURIComponent(path)
    }
  ),

  selectFilesIsMfs: createSelector(
    'selectFilesPathFromHash',
    (path) => {
      return path ? path.startsWith(MFS_PATH) : false
    }
  )
})
