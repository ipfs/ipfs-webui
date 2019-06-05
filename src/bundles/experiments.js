const ACTIONS = {
  EXP_TOGGLE: 'EXPERIMENTS_EXP_TOGGLE'
}

// setup experiments
const EXPERIMENTS = {
  npm: {
    action: async () => null,
    enabled: false,
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
    desktop: false
  },
  tpd: {
    action: async () => null,
    enabled: false
  },
  tpda: {
    action: async () => null,
    enabled: false
  },
  tpdb: {
    action: async () => null,
    enabled: false
  }
}

// helpers
const createAction = (type, key) => ({
  type: type,
  payload: { key }
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
  reducer: (state = {}, action) => {
    if (action.type === ACTIONS.EXP_TOGGLE) {
      return toggleEnabled(state, action.payload.key)
    }
    return state
  },
  doExpToggleAction: (key, enabled) => async ({ dispatch }) => {
    if (!key) return

    const experiment = EXPERIMENTS[key]
    const dispatchAction = createAction(ACTIONS.EXP_TOGGLE, key)

    if (typeof experiment.action === 'function') {
      await Promise.resolve(experiment.action(enabled))
        .then(res => dispatch(dispatchAction))
        .catch(err => console.error(err))
    } else {
      dispatch(dispatchAction)
    }
  },
  selectExperiments: () =>
    objAsArr(EXPERIMENTS).filter(e => !!e.desktop === !!window.ipfsDesktop),
  selectExpState: state => state.experiments
}
