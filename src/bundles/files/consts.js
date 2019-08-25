export const IS_MAC = navigator.userAgent.indexOf('Mac') !== -1

export const ACTIONS = {
  FETCH: 'FETCH',
  MOVE: 'MOVE',
  COPY: 'COPY',
  DELETE: 'DELETE',
  MAKE_DIR: 'MAKEDIR',
  WRITE: 'WRITE',
  DOWNLOAD_LINK: 'DOWNLOADLINK',
  ADD_BY_PATH: 'ADDBYPATH',
  PIN_ADD: 'PIN_ADD',
  PIN_REMOVE: 'PIN_REMOVE',
  PIN_LIST: 'PIN_LIST',
  FILES_SIZE_GET: 'FILES_SIZE_GET'
}

export const SORTING = {
  BY_NAME: 'name',
  BY_SIZE: 'size'
}

export const IGNORED_FILES = [
  '.DS_Store',
  'thumbs.db',
  'desktop.ini'
]

export const DEFAULT_STATE = {
  pageContent: null,
  pins: [],
  sorting: { // TODO: cache this
    by: SORTING.BY_NAME,
    asc: true
  },
  pending: [],
  finished: [],
  failed: []
}
