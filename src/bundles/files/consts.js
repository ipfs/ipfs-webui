export const IS_MAC = navigator.userAgent.indexOf('Mac') !== -1

/**
 * @typedef {import('./protocol').Message} Message
 * @typedef {import('./protocol').Model} Model
 */
export const ACTIONS = {
  /** @type {'FILES_FETCH'} */
  FETCH: ('FILES_FETCH'),
  /** @type {'FILES_MOVE'} */
  MOVE: ('FILES_MOVE'),
  /** @type {'FILES_COPY'} */
  COPY: ('FILES_COPY'),
  /** @type {'FILES_DELETE'} */
  DELETE: ('FILES_DELETE'),
  /** @type {'FILES_MAKEDIR'} */
  MAKE_DIR: ('FILES_MAKEDIR'),
  /** @type {'FILES_WRITE'} */
  WRITE: ('FILES_WRITE'),
  /** @type {'FILES_DOWNLOADLINK'} */
  DOWNLOAD_LINK: ('FILES_DOWNLOADLINK'),
  /** @type {'FILES_SHARE_LINK'} */
  SHARE_LINK: ('FILES_SHARE_LINK'),
  /** @type {'FILES_ADDBYPATH'} */
  ADD_BY_PATH: ('FILES_ADDBYPATH'),
  /** @type {'FILES_PIN_ADD'} */
  PIN_ADD: ('FILES_PIN_ADD'),
  /** @type {'FILES_PIN_REMOVE'} */
  PIN_REMOVE: ('FILES_PIN_REMOVE'),
  /** @type {'FILES_PIN_LIST'} */
  PIN_LIST: ('FILES_PIN_LIST'),
  /** @type {'FILES_SIZE_GET'} */
  SIZE_GET: ('FILES_SIZE_GET'),
  /** @type {'FILES_DISMISS_ERRORS'} */
  DISMISS_ERRORS: ('FILES_DISMISS_ERRORS'),
  /** @type {'FILES_CLEAR_ALL'} */
  CLEAR_ALL: ('FILES_CLEAR_ALL'),
  /** @type {'FILES_WRITE_UPDATED'} */
  WRITE_UPDATED: ('FILES_WRITE_UPDATED'),
  /** @type {'FILES_UPDATE_SORT'} */
  UPDATE_SORT: ('FILES_UPDATE_SORT')
}

export const SORTING = {
  /** @type {'name'} */
  BY_NAME: ('name'),
  /** @type {'size'} */
  BY_SIZE: ('size')
}

export const IGNORED_FILES = [
  '.DS_Store',
  'thumbs.db',
  'desktop.ini'
]

/** @type {Model} */
export const DEFAULT_STATE = {
  pageContent: null,
  mfsSize: -1,
  pins: [],
  sorting: { // TODO: cache this
    by: SORTING.BY_NAME,
    asc: true
  },
  pending: [],
  finished: [],
  failed: []
}
