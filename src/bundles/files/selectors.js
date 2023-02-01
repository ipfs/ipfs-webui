import { createSelector } from 'redux-bundler'
import { ACTIONS } from './consts.js'
import { infoFromPath } from './utils.js'

/**
 * @typedef {import('./protocol').Model} Files
 * @typedef {import('./protocol').PageContent} PageContent
 * @typedef {Object} Model
 * @property {Files} files
 *
 * @typedef {import('redux-bundler').Selectors<ReturnType<typeof selectors>>} Selectors
 */

/**
 * @template M, I
 * @typedef {import('./protocol').PendingJob<M, I>} PendingJob
 */

const selectors = () => ({
  /**
   * @param {Model} state
   * @returns {null|PageContent}
   */
  selectFiles: (state) => state.files.pageContent,

  /**
   * @param {Model} state
   */
  selectCurrentDirectorySize: (state) => {
    return state.files.pageContent?.type === 'directory' && state.files.pageContent?.content?.reduce((prev, curr) => prev + curr.size, 0)
  },

  /**
   * @param {Model} state
   * @returns {string[]}
   */
  selectPins: (state) => state.files.pins,

  /**
   * @param {Model} state
   * @returns {number}
   */
  selectFilesSize: (state) => state.files.mfsSize,

  /**
   * @param {Model} state
   */
  selectFilesIsFetching: (state) => state.files.pending.some(a => a.type === ACTIONS.FETCH),

  /**
   * @param {Model} state
   * @returns {boolean}
   */
  selectShowLoadingAnimation: (state) => {
    const pending = state.files.pending.find(a => a.type === ACTIONS.FETCH)
    return pending ? (Date.now() - pending.start) > 1000 : false
  },

  /**
   * @param {Model} state
   */
  selectFilesSorting: (state) => state.files.sorting,

  /**
   * @param {Model} state
   * @returns {PendingJob<void, {progress: number, entries: {size:number, path: string}[]}>[]}
   */
  selectFilesPending: (state) =>
    state.files.pending.filter(s => s.type === ACTIONS.WRITE && s.message != null),

  /**
   * @param {Model} state
   */
  selectFilesFinished: (state) =>
    state.files.finished.filter(s => s.type === ACTIONS.WRITE),

  /**
   * @param {Model} state
   */
  selectFilesHasError: (state) => state.files.failed.length > 0,

  /**
   * @param {Model} state
   */
  selectFilesErrors: (state) => state.files.failed,

  /**
   * @param {Model} state
   */
  selectHasUpperDirectory: (state) => state.files.pageContent?.type === 'directory' && state.files.pageContent?.upper,

  selectFilesPathInfo: createSelector(
    'selectRouteInfo',
    /**
     * @param {object} routeInfo
     * @param {string} routeInfo.url
     */
    (routeInfo) => {
      return infoFromPath(routeInfo.url)
    }
  )
})

export default selectors
