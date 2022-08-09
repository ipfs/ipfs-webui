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

export const cliCmdKeys = {
  DOWNLOAD_OBJECT_COMMAND: 'downloadObjectCommand',
  REMOVE_FILE_FROM_IPFS: 'removeFileFromIpfs',
  UPDATE_IPFS_CONFIG: 'updateIpfsConfig',
  PIN_OBJECT: 'pinObject',
  RENAME_IPFS_OBJECT: 'renameObject',
  ADD_FILE: 'addNewFile',
  ADD_DIRECTORY: 'addNewDirectory',
  CREATE_NEW_DIRECTORY: 'createNewDirectory',
  FROM_IPFS: 'fromIpfs',
  ADD_NEW_PEER: 'addNewPeer',
  PUBLISH_WITH_IPNS: 'publishWithIPNS',
  DOWNLOAD_CAR_COMMAND: 'downloadCarCommand'
}

export const cliCmdPrefixes = {
  PIN_OBJECT: 'ipfs pin'
}

export const cliCommandList = {
  [cliCmdKeys.UPDATE_IPFS_CONFIG]: () => 'ipfs config replace <path-to-settings.json>',
  /**
   * @param {string} filePath
   */
  [cliCmdKeys.REMOVE_FILE_FROM_IPFS]: (filePath) => `ipfs files rm -r "${filePath}"`,
  /**
   * @param {string} cid
   */
  [cliCmdKeys.DOWNLOAD_OBJECT_COMMAND]: (cid) => `ipfs get ${cid}`,
  /**
   * @param {string} cid
   * @param {string} op
   */
  [cliCmdKeys.PIN_OBJECT]: (cid, op) => `${cliCmdPrefixes.PIN_OBJECT} ${op} ${cid}`,
  /**
   * @param {string} filePath
   * @param {string} fileName
   */
  [cliCmdKeys.RENAME_IPFS_OBJECT]: (filePath, fileName) => {
    const prefix = filePath.replace(fileName, '').trim()
    return `ipfs files mv "${filePath}" "${prefix}<new-name>"`
  },
  /**
   * @param {string} path
   */
  [cliCmdKeys.ADD_FILE]: (path) => `ipfs files cp /ipfs/$(ipfs add -Q <local-file>) "${path}/<dest-name>"`,
  /**
   * @param {string} path
   */
  [cliCmdKeys.ADD_DIRECTORY]: (path) => `ipfs files cp /ipfs/$(ipfs add -r -Q <local-folder>) "${path}/<dest-name>"`,
  /**
   * @param {string} path
   */
  [cliCmdKeys.CREATE_NEW_DIRECTORY]: (path) => `ipfs files mkdir "${path}/<folder-name>"`,
  /**
   * @param {string} path
   */
  [cliCmdKeys.FROM_IPFS]: (path) => `ipfs files cp /ipfs/<cid> "${path}/<dest-name>"`,
  [cliCmdKeys.ADD_NEW_PEER]: () => 'ipfs swarm connect <peer-multiaddr>',
  /**
   * @param {string} ipfsPath
   * @param {string} name
   */
  [cliCmdKeys.PUBLISH_WITH_IPNS]: (ipfsPath, name) => `ipfs name publish ${ipfsPath} --key="${name}"`,
  /**
   * @param {string} cid
   */
  [cliCmdKeys.DOWNLOAD_CAR_COMMAND]: (cid) => `ipfs dag export ${cid}`
}
