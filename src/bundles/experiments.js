const createAction = (type, key, cb) => ({
  type: type,
  payload: { key, cb }
})

const ACTIONS = {
  // NPM_TOGGLE: 'EXPERIMENTS_NPM_TOGGLE',
  EXP_TOGGLE: 'EXPERIMENTS_EXP_TOGGLE'
}

// setup experiments, only the enabled key is persisted
const EXPERIMENTS = {
  npm: {
    action: createAction(ACTIONS.EXP_TOGGLE, 'npm'),
    enabled: false,
    desktop: false
  },
  tpd: {
    action: createAction(ACTIONS.EXP_TOGGLE, 'tpd'),
    enabled: false,
    desktop: false
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
      action.payload.cb && action.payload.cb()
      return toggleEnabled(state, action.payload.key)
    }
    return state
  },
  doToggleAction: key => async ({ dispatch }) => {
    key && dispatch(EXPERIMENTS[key].action)
  },
  selectIsIpfsDesktop: () => !!window.ipfsDesktop,
  selectExperiments: () => objAsArr(EXPERIMENTS),
  selectState: state => state.experiments
}
