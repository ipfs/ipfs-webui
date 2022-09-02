/**
 * @typedef {Object} IPFSDesktop
 * @property {string} version
 * @property {string} countlyDeviceId
 * @property {string[]} countlyActions
 * @property {() => Promise<void|Array<{path:string, size:number, content:AsyncIterable<Uint8Array>}>>} selectDirectory
 * @property {(consent:string[]) => void} removeConsent
 * @property {(consent:string[]) => void} addConsent
 * @property {(language:string) => void} updateLanguage
 */

// @ts-ignore
/** @type {{ ipfsDesktop?: IPFSDesktop } & Window} */
const root = (window)

/**
 * @typedef {import('redux-bundler').Selectors<typeof baseSelectors>} BaseSelectors
 */

const baseSelectors = {
  /**
   * @returns {boolean}
   */
  selectIsIpfsDesktop: () => !!root.ipfsDesktop,
  /**
   * @returns {string[]}
   */
  selectDesktopCountlyActions: () => ([])
}

const desktopSelectors = {
  ...baseSelectors,
  selectDesktopVersion: () => root.ipfsDesktop?.version,

  selectDesktopCountlyDeviceId: () => root.ipfsDesktop?.countlyDeviceId,

  selectDesktopCountlyActions: () => root.ipfsDesktop?.countlyActions
}

/**
 * @typedef {import('redux-bundler').Selectors<typeof desktopSelectors>} Selectors
 */
const selectors = root.ipfsDesktop
  ? desktopSelectors
  : baseSelectors

const desktopActions = {
  /**
   * @param {string[]} consent
   * @returns {() => void}
   */
  doDesktopAddConsent: consent => () => {
    return root.ipfsDesktop?.addConsent(consent)
  },

  /**
   * @param {string[]} consent
   * @returns {() => void}
   */
  doDesktopRemoveConsent: consent => () => {
    return root.ipfsDesktop?.removeConsent(consent)
  },

  /**
   * @param {string} language
   * @returns {() => void}
   */
  doDesktopUpdateLanguage: language => () => {
    return root.ipfsDesktop?.updateLanguage(language)
  }
}

/**
 * @typedef {never} Message
 * @typedef {Object} Model
 * @typedef {Object} State
 * @property {Model} ipfsDesktop
 * @typedef {import('redux-bundler').Actions<typeof desktopActions>} Actions
 * @typedef {Selectors & Actions} Ext
 * @typedef {import('redux-bundler').Context<State, Message, Ext>} Context
 */

const actions = root.ipfsDesktop
  ? desktopActions
  : {}

const bundle = {
  name: 'ipfsDesktop',
  /**
   * @param {Model} [state]
   * @returns {Model}
   */
  reducer: (state = {}) => state,
  ...selectors,
  ...actions
}

export default bundle
