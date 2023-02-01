import { createSelector } from 'redux-bundler'
import * as Enum from './enum.js'
export const ACTIONS = Enum.from([
  'EXPERIMENTS_TOGGLE',
  'EXPERIMENTS_UPDATE_STATE'
])

/**
 * @typedef {import('./task').Perform<'EXPERIMENTS_TOGGLE', Fail, Succeed, Init>} Toggle
 * @typedef {Object} Succeed
 * @property {string} key
 * @property {boolean} value
 *
 * @typedef {Object} Fail
 * @property {string} key
 * @property {string} message
 *
 * @typedef {Object} Init
 * @property {string} key
 *
 * @typedef {Object} UpdateState
 * @property {'EXPERIMENTS_UPDATE_STATE'} type
 * @property {Model} payload
 *
 * @typedef {Toggle|UpdateState} Message
 *
 * @typedef {Record<string, {blocked:boolean, enabled:boolean}>} Model
 *
 * @typedef {Object} State
 * @property {Model} experiments
 */

/**
 * @type {Array<{key:string}>}
 */
const EXPERIMENTS = []

/**
 *
 * @param {Model} state
 * @param {Model} payload
 * @returns {Model}
 */
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

/**
 * @param {Model} state
 * @param {string} key
 * @returns {Model}
 */
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

/**
 * @param {Model} state
 * @param {string} key
 * @returns {Model}
 */
const unblock = (state, key) => {
  return {
    ...state,
    [key]: {
      ...state[key],
      blocked: false
    }
  }
}

/**
 * @param {Model} state
 * @param {string} key
 * @returns {Model}
 */
const block = (state, key) => {
  return {
    ...state,
    [key]: {
      ...state[key],
      blocked: true
    }
  }
}

/**
 * @typedef {import('redux-bundler').Selectors<typeof selectors>} Selectors
 */

const selectors = {
  /**
   * @param {State} state
   */
  selectExperimentsState: state => state.experiments,

  selectExperiments: createSelector(
    'selectExperimentsState',
    /**
     * @param {Model} state
     */
    (state) =>
      EXPERIMENTS.map(e => ({
        ...e,
        ...state[e.key]
      }))
  )
}

/**
 * @typedef {import('redux-bundler').Actions<typeof actions>} Actions
 * @typedef {Selectors & Actions} Ext
 * @typedef {import('redux-bundler').Context<State, Message, Ext>} Context
 */

const actions = {
  /**
   * @param {string} key
   * @returns {function(Context): void}
   */
  doExpToggleAction: key => ({ dispatch }) => {
    if (!key) return

    dispatch({
      type: ACTIONS.EXPERIMENTS_TOGGLE,
      task: {
        status: 'Init',
        id: Symbol(ACTIONS.EXPERIMENTS_TOGGLE),
        init: { key }
      }
    })
  }
}

const experimentsBundle = {
  name: 'experiments',

  persistActions: [
    ACTIONS.EXPERIMENTS_TOGGLE,
    ACTIONS.EXPERIMENTS_UPDATE_STATE
  ],

  /**
   * @param {Model} state
   * @param {Message} action
   * @returns {Model}
   */
  reducer: (state = {}, action) => {
    switch (action.type) {
      case ACTIONS.EXPERIMENTS_TOGGLE: {
        const { task } = action
        switch (task.status) {
          case 'Init': {
            return block(state, task.init.key)
          }
          case 'Exit': {
            const { result } = task
            if (result.ok) {
              return toggleEnabled(state, result.value.key)
            } else {
              return unblock(state, result.error.key)
            }
          }
          default: {
            return state
          }
        }
      }
      case ACTIONS.EXPERIMENTS_UPDATE_STATE: {
        return mergeState(state, action.payload)
      }

      default:
        return state
    }
  },

  ...selectors,
  ...actions
}
export default experimentsBundle
