import { createSelector } from 'redux-bundler'
import { ACTIONS } from './consts'
import { infoFromPath } from './utils'

export default () => ({
  selectFiles: (state) => state.files.pageContent,

  selectCurrentDirectorySize: (state) => state.files.pageContent?.content?.reduce((prev, curr) => prev + curr.size, 0),

  selectPins: (state) => state.files.pins,

  selectFilesSize: (state) => state.files.mfsSize,

  selectFilesIsFetching: (state) => state.files.pending.some(a => a.type === ACTIONS.FETCH),

  selectShowLoadingAnimation: (state) => {
    const pending = state.files.pending.find(a => a.type === ACTIONS.FETCH)
    return pending ? (Date.now() - pending.start) > 1000 : false
  },

  selectFilesSorting: (state) => state.files.sorting,

  selectFilesPending: (state) => state.files.pending.filter(s => s.type === ACTIONS.WRITE && s.data.progress),

  selectFilesFinished: (state) => state.files.finished.filter(s => s.type === ACTIONS.WRITE),

  selectFilesHasError: (state) => state.files.failed.length > 0,

  selectFilesErrors: (state) => state.files.failed,

  selectHasUpperDirectory: (state) => !!state.files.pageContent?.upper,

  selectFilesPathInfo: createSelector(
    'selectRouteInfo',
    (routeInfo) => {
      return infoFromPath(routeInfo.url)
    }
  )
})
