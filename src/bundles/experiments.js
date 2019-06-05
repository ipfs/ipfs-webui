export const ACTIONS = {
  EXP_TOGGLE_SUCCESS: 'EXPERIMENTS_TOGGLE_SUCCESS',
  EXP_TOGGLE_FAIL: 'EXPERIMENTS_TOGGLE_FAIL',
  EXP_UPDATE_STATE: 'EXPERIMENTS_UPDATE_STATE'
}

// setup experiments
const getExperiments = store => ({
  npmOnIpfs: {
    action: async enabled => store.doDesktopToggleExperiment('npmOnIpfs'),
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
})

// helpers
const getExperiment = (store, key) => getExperiments(store)[key]

const createAction = (type, payload) => ({
  type,
  payload
})

const objAsArr = obj =>
  Object.keys(obj).map(i => ({
    ...obj[i],
    key: i
  }))

const isEnabled = (state, key) => {
  if (state && state[key]) {
    return state[key].enabled
  }
}

const toggleEnabled = (state, key) => {
  return {
    ...state,
    [key]: {
      ...state[key],
      enabled: !isEnabled(state, key)
    }
  }
}
//

export default {
  name: 'experiments',
  // persist all actions
  persistActions: Object.values(ACTIONS),

  init: store => {
    // get enabled desktop experiments and set as default state
    if (window.ipfsDesktop) {
      store.doExpSetEnabled(store.selectDesktopSettings().experiments || {})
    }
  },

  reducer: (state = {}, action) => {
    if (action.type === ACTIONS.EXP_UPDATE_STATE) {
      const newState = Object.keys(action.payload).reduce(
        (all, key) => ({
          ...all,
          [key]: {
            ...state[key],
            ...action.payload[key]
          }
        }),
        state
      )
      return newState
    }
    if (action.type === ACTIONS.EXP_TOGGLE_SUCCESS) {
      return toggleEnabled(state, action.payload.key)
    }

    if (action.type === ACTIONS.EXP_TOGGLE_FAIL) {
      // do something on fail
    }

    return state
  },

  doExpToggleAction: (key, enabled) => async ({ dispatch, store }) => {
    if (!key) return

    const experiment = getExperiment(store, key)

    if (typeof experiment.action === 'function') {
      await Promise.resolve(experiment.action(enabled))
        .then(res =>
          dispatch(createAction(ACTIONS.EXP_TOGGLE_SUCCESS, { key }))
        )
        .catch(err => {
          dispatch(createAction(ACTIONS.EXP_TOGGLE_FAIL, { key }))
          console.error(err)
        })
    } else {
      dispatch(createAction(ACTIONS.EXP_TOGGLE_SUCCESS, { key }))
    }
  },

  doExpSetEnabled: state => ({ dispatch }) => {
    dispatch(createAction(ACTIONS.EXP_UPDATE_STATE, state))
  },

  selectExperiments: state =>
    objAsArr(getExperiments()).filter(
      e => !!e.desktop === !!window.ipfsDesktop
    ),
  selectExpState: state => state.experiments
}
