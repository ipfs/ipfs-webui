import { createSelector } from 'redux-bundler'

export const ACTIONS = {
  EXP_TOGGLE_STARTED: 'EXPERIMENTS_TOGGLE_STARTED',
  EXP_TOGGLE_FINISHED: 'EXPERIMENTS_TOGGLE_FINISHED',
  EXP_TOGGLE_FAILED: 'EXPERIMENTS_TOGGLE_FAILED',
  EXP_UPDATE_STATE: 'EXPERIMENTS_UPDATE_STATE'
}

const EXPERIMENTS = []

const mergeState = (state, payload) =>
  Object.keys(payload).reduce(
    (all, key) => ({
      ...all,
      [key]: {
        ...state[key],
        ...payload[key]
      }
    }),
    state
  )

const toggleEnabled = (state, key) => {
  return unblock(
    {
      ...state,
      [key]: {
        ...state[key],
        enabled: !(state && state[key] && state[key].enabled)
      }
    },
    key
  )
}

const unblock = (state, key) => {
  return {
    ...state,
    [key]: {
      ...state[key],
      blocked: false
    }
  }
}

const block = (state, key) => {
  return {
    ...state,
    [key]: {
      ...state[key],
      blocked: true
    }
  }
}

export default {
  name: 'experiments',

  persistActions: [
    ACTIONS.EXP_TOGGLE_FINISHED,
    ACTIONS.EXP_TOGGLE_FAILED,
    ACTIONS.EXP_UPDATE_STATE
  ],

  reducer: (state = {}, action) => {
    if (action.type === ACTIONS.EXP_TOGGLE_STARTED) {
      return block(state, action.payload.key)
    }

    if (action.type === ACTIONS.EXP_UPDATE_STATE) {
      return mergeState(state, action.payload)
    }

    if (action.type === ACTIONS.EXP_TOGGLE_FINISHED) {
      return toggleEnabled(state, action.payload.key)
    }

    if (action.type === ACTIONS.EXP_TOGGLE_FAILED) {
      return unblock(state, action.payload.key)
    }

    return state
  },

  doExpToggleAction: key => ({ dispatch }) => {
    if (!key) return

    dispatch({
      type: ACTIONS.EXP_TOGGLE_STARTED,
      payload: { key }
    })
  },

  selectExperimentsState: state => state.experiments,

  selectExperiments: createSelector(
    'selectExperimentsState',
    (state) =>
      EXPERIMENTS.map(e => ({
        ...e,
        ...state[e.key]
      }))
  )
}
