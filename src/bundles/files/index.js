import { sortFiles } from './utils'
import { DEFAULT_STATE, ACTIONS, SORTING } from './consts'
import selectors from './selectors'
import actions from './actions'

export { ACTIONS }

export const sorts = SORTING

/**
 * @typedef {import('./protocol').Model} Model
 * @typedef {import('./protocol').Message} Message
 * @typedef {import('./protocol').JobState<any, Error, any>} JobState
 */
export default () => {
  return {
    name: 'files',

    /**
     * @param {Model} state
     * @param {Message} action
     * @returns {Model}
     */
    reducer: (state = DEFAULT_STATE, action) => {
      switch (action.type) {
        case ACTIONS.DELETE:
        case ACTIONS.ADD_BY_PATH:
        case ACTIONS.DOWNLOAD_LINK:
        case ACTIONS.SHARE_LINK:
        case ACTIONS.MOVE:
        case ACTIONS.COPY:
        case ACTIONS.MAKE_DIR:
        case ACTIONS.PIN_ADD:
        case ACTIONS.PIN_REMOVE:
        case ACTIONS.WRITE: {
          return updateJob(state, action.job, action.type)
        }
        case ACTIONS.PIN_LIST: {
          const { pins } = action.job.status === 'Done' ? action.job.value : state
          return {
            ...updateJob(state, action.job, action.type),
            pins
          }
        }
        case ACTIONS.FETCH: {
          const result = action.job.status === 'Done' ? action.job.value : null
          const { pageContent, pins } = result
            ? {
              pageContent: result,
              pins: result.type === 'directory' && result.path === '/pins'
                ? result.content.map($ => $.cid)
                : state.pins
            }
            : state

          return {
            ...updateJob(state, action.job, action.type),
            pageContent,
            pins
          }
        }
        case ACTIONS.DISMISS_ERRORS: {
          return {
            ...state,
            failed: []
          }
        }
        case ACTIONS.CLEAR_ALL: {
          return {
            ...state,
            failed: [],
            finished: [],
            pending: []
          }
        }
        case ACTIONS.UPDATE_SORT: {
          const { pageContent } = state
          if (pageContent && pageContent.type === 'directory') {
            const content = sortFiles(pageContent.content, action.payload)
            return {
              ...state,
              pageContent: {
                ...pageContent,
                content
              }
            }
          } else {
            return state
          }
        }
        case ACTIONS.SIZE_GET: {
          const mfsSize = action.job.status === 'Done'
            ? action.job.value.size
            : state.mfsSize

          return {
            ...updateJob(state, action.job, action.type),
            mfsSize
          }
        }
        default: {
          return state
        }
      }
    },
    ...actions(),
    ...selectors()
  }
}

/**
 * Updates state of the given job.
 * @param {Model} state
 * @param {JobState} job
 * @param {*} type
 * @returns {Model}
 */
const updateJob = (state, job, type) => {
  switch (job.status) {
    case 'Idle': {
      return {
        ...state,
        pending: [
          ...state.pending,
          {
            ...job,
            type,
            start: Date.now()
          }
        ]
      }
    }
    case 'Active': {
      const { pending, rest } = pullPendig(state.pending, job)
      return {
        ...state,
        pending: [
          ...rest,
          {
            ...pending,
            ...job
          }
        ]
      }
    }
    case 'Failed': {
      const { pending, rest } = pullPendig(state.pending, job)
      return {
        ...state,
        pending: rest,
        failed: [
          ...state.failed,
          {
            ...pending,
            ...job,
            end: Date.now()
          }
        ]
      }
    }
    case 'Done': {
      const { pending, rest } = pullPendig(state.pending, job)
      return {
        ...state,
        pending: rest,
        finished: [
          ...state.finished,
          {
            ...pending,
            ...job,
            end: Date.now()
          }
        ]
      }
    }
    default: {
      console.error('Job has an invalid state', job)
      return state
    }
  }
}

/**
 * @template T
 * @typedef {import('./protocol').PendingJob<T>} PendingJob
 */

/**
 * Takes array of pending job states and job that was updated and returns
 * array of pending jobs but the one passed & start time of that job
 * @template T
 * @param {PendingJob<T>[]} jobs
 * @param {JobState} job
 * @returns {{pending:PendingJob<T>, rest:PendingJob<T>[]}}
 */
const pullPendig = (jobs, job) => {
  const { id } = job
  const pending = jobs.find($ => $.id === id)

  if (pending == null) {
    throw Error('Unable to find a pending task')
  }

  return {
    pending,
    rest: jobs.filter($ => $.id !== id)
  }
}
