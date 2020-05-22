import { sortFiles } from './utils'
import { DEFAULT_STATE, ACTIONS, SORTING } from './consts'
import selectors from './selectors'
import actions from './actions'

export { ACTIONS }

export const sorts = SORTING

export default () => {
  return {
    name: 'files',

    reducer: (state = DEFAULT_STATE, action) => {
      if (!action.type.startsWith('FILES_')) {
        return state
      }

      if (action.type === 'FILES_DISMISS_ERRORS') {
        return {
          ...state,
          failed: []
        }
      }

      if (action.type === 'FILES_CLEAR_ALL') {
        return {
          ...state,
          failed: [],
          finished: [],
          pending: []
        }
      }

      if (action.type === 'FILES_UPDATE_SORT') {
        const pageContent = state.pageContent

        return {
          ...state,
          pageContent: {
            ...pageContent,
            content: sortFiles(pageContent.content, action.payload)
          },
          sorting: action.payload
        }
      }

      const parts = action.type.split('_').splice(1)

      const status = parts.pop()
      const type = parts.join('_')

      const { id, ...data } = action.payload

      if (status === 'STARTED') {
        return {
          ...state,
          pending: [
            ...state.pending,
            {
              type: type,
              id: id,
              start: Date.now(),
              data: data
            }
          ]
        }
      } else if (status === 'UPDATED') {
        const pendingAction = state.pending.find(a => a.id === id)

        return {
          ...state,
          pending: [
            ...state.pending.filter(a => a.id !== id),
            {
              ...pendingAction,
              data: {
                ...data,
                hasError: true
              }
            }
          ]
        }
      } else if (status === 'FAILED') {
        const pendingAction = state.pending.find(a => a.id === id)
        let additional

        if (type === ACTIONS.FETCH) {
          additional = {
            pageContent: null
          }
        }

        return {
          ...state,
          ...additional,
          pending: state.pending.filter(a => a.id !== id),
          failed: [
            ...state.failed,
            {
              ...pendingAction,
              end: Date.now(),
              error: data.error
            }
          ]
        }
      } else if (status === 'FINISHED') {
        const action = state.pending.find(a => a.id === id)
        let additional

        if (type === ACTIONS.FILES_SIZE_GET) {
          additional = {
            mfsSize: data.size
          }
        }

        if (type === ACTIONS.FETCH) {
          additional = {
            pageContent: data
          }

          if (data.path === '/pins') {
            additional.pins = data.content.map(f => f.hash)
          }
        }

        if (type === ACTIONS.PIN_LIST) {
          additional = {
            pins: data.pins
          }
        }

        return {
          ...state,
          ...additional,
          pending: state.pending.filter(a => a.id !== id),
          finished: [
            ...state.finished,
            {
              ...action,
              data: data,
              end: Date.now()
            }
          ]
        }
      }

      return state
    },

    ...actions(),
    ...selectors()
  }
}
