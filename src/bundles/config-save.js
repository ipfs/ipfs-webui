// @ts-check

import * as Enum from './enum.js'
import { perform } from './task.js'

/**
 * @typedef {import('./task').Perform<'CONFIG_SAVE', Error, void, void>} ConfigSave
 *
 * @typedef {ConfigSave} Message
 *
 * @typedef {Object} Model
 * @property {boolean} isSaving
 * @property {number} [lastSuccess]
 * @property {number} [lastError]
 * @property {string} [errorMessage]
 *
 * @typedef {Object} State
 * @property {Model} config_save
 */

/**
 * @typedef {import('redux-bundler').Selectors<typeof selectors>} Selectors
 */

const selectors = {
  /**
   * @param {State} state
   */
  selectConfigIsSaving: state => state.config_save.isSaving,
  /**
   * @param {State} state
   */
  selectConfigSaveLastSuccess: state => state.config_save.lastSuccess,
  /**
   * @param {State} state
   */
  selectConfigSaveLastError: state => state.config_save.lastError
}

/**
 * @typedef {import('redux-bundler').Actions<typeof actions>} Actions
 * @typedef {import('./ipfs-provider').Extra} Extra
 * @typedef {Selectors & Actions} Ext
 * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} Context
 */

const actions = {
  /**
   * @param {string} configStr
   * @returns {function(Context):Promise<void>}
   */
  doSaveConfig: (configStr) => async ({ store }) => {
    if (store.selectConfigIsSaving()) {
      console.log('doSaveConfig skipped, config save already in progress')
    } else {
      await store.doPerformSaveConfig(configStr)
    }
  },

  /**
   * @param {string} configStr
   * @returns {function(Context):Promise<void>}
   */
  doPerformSaveConfig: (configStr) => perform('CONFIG_SAVE', async (context) => {
    const result = await attempt(async () => {
      const obj = JSON.parse(configStr)
      const ipfs = context.getIpfs()
      if (ipfs == null) {
        throw Error('IPFS node is not found')
      }

      await ipfs.config.replace(obj)
    })

    if (!result.ok) {
      throw result.error
    }

    // @ts-ignore - Nor TS nor @gozala can tell where below function is defined
    // but it does appear to exist at runtime 🤷‍♂️
    await context.store.doMarkConfigAsOutdated()
  })
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<{ok:true, value:T}|{ok:false, error:Error}>}
 */
const attempt = async (fn) => {
  try {
    const value = await fn()
    return { ok: true, value }
  } catch (err) {
    const error = /** @type {Error} */(err)
    return { ok: false, error }
  }
}

export const ACTIONS = Enum.from(['CONFIG_SAVE'])

const bundle = {
  name: 'config_save',

  /**
   * @param {Model} state
   * @param {Message} action
   * @returns {Model}
   */
  reducer: (state = { isSaving: false }, action) => {
    switch (action.type) {
      case ACTIONS.CONFIG_SAVE: {
        const { task } = action
        switch (task.status) {
          case 'Init': {
            return { ...state, isSaving: true }
          }
          case 'Exit': {
            const { result } = task
            if (result.ok) {
              return { ...state, isSaving: false, lastSuccess: Date.now() }
            } else {
              const { error } = result
              const errorMessage = (error && error.message) || String(error)
              return { ...state, isSaving: false, lastError: Date.now(), errorMessage }
            }
          }
          default: {
            return state
          }
        }
      }
      default: {
        return state
      }
    }
  },

  ...selectors,
  ...actions
}

export default bundle
