import { sortFiles } from './utils.js'
import { DEFAULT_STATE, ACTIONS, SORTING } from './consts.js'
import selectors from './selectors.js'
import actions from './actions.js'

export { ACTIONS }

export const sorts = SORTING

/**
 * @typedef {import('./protocol').Model} Model
 * @typedef {import('./protocol').Message} Message
 * @typedef {import('../task').SpawnState<any, Error, any, any>} JobState
 */
const createFilesBundle = () => {
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
          return updateJob(state, action.task, action.type)
        case ACTIONS.PIN_ADD:
        case ACTIONS.PIN_REMOVE: {
          const updatedState = updateJob(state, action.task, action.type)
          // If sorting is by pinned and we have page content, re-sort
          if (updatedState.sorting.by === SORTING.BY_PINNED && updatedState.pageContent && updatedState.pageContent.type === 'directory') {
            const content = sortFiles(updatedState.pageContent.content, updatedState.sorting, updatedState.pins)
            return {
              ...updatedState,
              pageContent: {
                ...updatedState.pageContent,
                content
              }
            }
          }
          return updatedState
        }
        case ACTIONS.WRITE: {
          return updateJob(state, action.task, action.type)
        }
        case ACTIONS.PIN_LIST: {
          const { task, type } = action

          const pins = task.status === 'Exit' && task.result.ok
            ? task.result.value.pins.map(String)
            : state.pins

          const updatedState = {
            ...updateJob(state, task, type),
            pins
          }

          // If sorting is by pinned and we have page content, re-sort
          if (updatedState.sorting.by === SORTING.BY_PINNED && updatedState.pageContent && updatedState.pageContent.type === 'directory') {
            const content = sortFiles(updatedState.pageContent.content, updatedState.sorting, pins)
            return {
              ...updatedState,
              pageContent: {
                ...updatedState.pageContent,
                content
              }
            }
          }

          return updatedState
        }
        case ACTIONS.FETCH: {
          const { task, type } = action
          const result = task.status === 'Exit' && task.result.ok
            ? task.result.value
            : null
          let pageContent = result || state.pageContent
          // Apply current sorting to the fetched content
          if (pageContent && pageContent.type === 'directory' && pageContent.content) {
            const sortedContent = sortFiles(pageContent.content, state.sorting, state.pins)
            pageContent = {
              ...pageContent,
              content: sortedContent
            }
          }

          return {
            ...updateJob(state, task, type),
            pageContent
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
          const { pageContent, pins } = state

          // Persist sorting preference to localStorage
          try {
            window.localStorage?.setItem('files.sorting', JSON.stringify(action.payload))
          } catch (error) {
            console.warn('Failed to save files.sorting to localStorage:', error)
          }

          if (pageContent && pageContent.type === 'directory') {
            const content = sortFiles(pageContent.content, action.payload, pins)
            return {
              ...state,
              pageContent: {
                ...pageContent,
                content
              },
              sorting: action.payload
            }
          } else {
            return {
              ...state,
              sorting: action.payload
            }
          }
        }
        case ACTIONS.SIZE_GET: {
          const { task, type } = action
          const mfsSize = task.status === 'Exit' && task.result.ok
            ? task.result.value.size
            : state.mfsSize

          return {
            ...updateJob(state, task, type),
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
export default createFilesBundle
/**
 * Updates state of the given job.
 * @param {Model} state
 * @param {JobState} task
 * @param {*} type
 * @returns {Model}
 */
const updateJob = (state, task, type) => {
  switch (task.status) {
    case 'Init': {
      return {
        ...state,
        pending: [
          ...state.pending,
          {
            ...task,
            type,
            status: 'Pending',
            start: Date.now()
          }
        ]
      }
    }
    case 'Send': {
      const { pending, rest } = pullPending(state.pending, task)
      return {
        ...state,
        pending: [
          ...rest,
          {
            ...pending,
            ...task,
            status: 'Pending'
          }
        ]
      }
    }
    case 'Exit': {
      const { pending, rest } = pullPending(state.pending, task)

      if (task.result.ok) {
        return {
          ...state,
          pending: rest,
          finished: [
            ...state.finished,
            {
              ...pending,
              ...task,
              end: Date.now(),
              value: task.result.value,
              status: 'Done'
            }
          ]
        }
      } else {
        return {
          ...state,
          pending: rest,
          failed: [
            ...state.failed,
            {
              ...pending,
              ...task,
              end: Date.now(),
              error: task.result.error,
              status: 'Failed'
            }
          ]
        }
      }
    }
    default: {
      console.error('Task has an invalid state', task)
      return state
    }
  }
}

/**
 * @template T, I
 * @typedef {import('./protocol').PendingJob<T, I>} PendingJob
 */

/**
 * Takes array of pending job states and job that was updated and returns
 * array of pending jobs but the one passed & start time of that job
 * @template T, I
 * @param {PendingJob<T, I>[]} tasks
 * @param {JobState} task
 * @returns {{pending:PendingJob<T, I>, rest:PendingJob<T, I>[]}}
 */
const pullPending = (tasks, task) => {
  const { id } = task
  const pending = tasks.find($ => $.id === id)

  if (pending == null) {
    throw Error('Unable to find a pending task')
  }

  return {
    pending,
    rest: tasks.filter($ => $.id !== id)
  }
}
