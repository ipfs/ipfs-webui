const createAction = (type, key) => ({
  type: type,
  payload: { key }
})

const ACTIONS = {
  // NPM_TOGGLE: 'EXPERIMENTS_NPM_TOGGLE',
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
  // only the enabled key is persisted
  // add others below if required
  return {
    ...state,
    [key]: {
      enabled: !isEnabled(state, key)
    }
  }
}
//

export default {
  name: 'experiments',
  persistActions: Object.values(ACTIONS),
  reducer: (state = EXPERIMENTS, action) => {
    if (action.type === ACTIONS.EXP_TOGGLE) {
      return toggleEnabled(state, action.payload.key)
    }
    return state
  },
  doToggleAction: (key, enabled) => async ({ dispatch }) => {
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
  selectIsIpfsDesktop: () => !!window.ipfsDesktop,
  selectExperiments: () =>
    objAsArr(EXPERIMENTS).filter(e => !!e.desktop === !!window.ipfsDesktop),
  selectState: state => state.experiments
}
