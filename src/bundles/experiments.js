import { createSelector } from 'redux-bundler'

export const ACTIONS = {
  EXP_TOGGLE: 'EXPERIMENTS_TOGGLE',
  EXP_TOGGLE_SUCCESS: 'EXPERIMENTS_TOGGLE_SUCCESS',
  EXP_TOGGLE_FAIL: 'EXPERIMENTS_TOGGLE_FAIL',
  EXP_UPDATE_STATE: 'EXPERIMENTS_UPDATE_STATE'
}

const EXPERIMENTS = [
  {
    key: 'npmOnIpfs',
    actionUrls: [
      {
        url: 'https://github.com/ipfs-shipyard/npm-on-ipfs',
        key: 'readMoreUrl'
      },
      {
        url: 'https://github.com/ipfs-shipyard/npm-on-ipfs/issues',
        key: 'issueUrl'
      },
      {
        url: 'https://github.com/ipfs-shipyard/npm-on-ipfs',
        key: 'feedbackUrl'
      }
    ],
    desktop: true
  }
]

const mergeState = (state, payload) => Object.keys(payload).reduce(
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
  return unblock({
    ...state,
    [key]: {
      ...state[key],
      enabled: !(state && state[key] && state[key].enabled)
    }
  }, key)
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
    'EXPERIMENTS_TOGGLE_SUCCESS',
    'EXPERIMENTS_TOGGLE_FAIL',
    'EXPERIMENTS_UPDATE_STATE'
  ],

  reducer: (state = {}, action) => {
    if (action.type === ACTIONS.EXP_TOGGLE) {
      return block(state, action.payload.key)
    }

    if (action.type === ACTIONS.EXP_UPDATE_STATE) {
      return mergeState(state, action.payload)
    }

    if (action.type === ACTIONS.EXP_TOGGLE_SUCCESS) {
      return toggleEnabled(state, action.payload.key)
    }

    if (action.type === ACTIONS.EXP_TOGGLE_FAIL) {
      return unblock(state, action.payload.key)
    }

    return state
  },

  doExpToggleAction: key => async ({ dispatch }) => {
    if (!key) return

    dispatch({
      type: ACTIONS.EXP_TOGGLE,
      payload: { key }
    })
  },

  selectExperimentsState: state => state.experiments,

  selectExperiments: createSelector(
    'selectIsIpfsDesktop',
    'selectExperimentsState',
    (isDesktop, state) => EXPERIMENTS
      .filter(e => !!e.desktop === isDesktop)
      .map(e => ({
        ...e,
        ...state[e.key]
      }))
  )
}
