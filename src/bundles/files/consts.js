export const IS_MAC = navigator.userAgent.indexOf('Mac') !== -1

/** @enum {string} */
export const ACTIONS = {
  FETCH: 'FETCH',
  MOVE: 'MOVE',
  COPY: 'COPY',
  DELETE: 'DELETE',
  MAKE_DIR: 'MAKEDIR',
  WRITE: 'WRITE',
  DOWNLOAD_LINK: 'DOWNLOADLINK',
  SHARE_LINK: 'SHARE_LINK',
  ADD_BY_PATH: 'ADDBYPATH',
  PIN_ADD: 'PIN_ADD',
  PIN_REMOVE: 'PIN_REMOVE',
  PIN_LIST: 'PIN_LIST',
  FILES_SIZE_GET: 'FILES_SIZE_GET'
}

/** @enum {string} */
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

export const cliCmdKeys = {
  DOWNLOAD_OBJECT_COMMAND: 'downloadObjectCommand',
  DELETE_FILE_FROM_IPFS: 'deleteFileFromIpfs',
  UPDATE_IPFS_CONFIG: 'updateIpfsConfig',
  PIN_OBJECT: 'pinObject',
  RENAME_IPFS_OBJECT: 'renameObject',
  ADD_FILE: 'addNewFile',
  ADD_DIRECTORY: 'addNewDirectory',
  CREATE_NEW_DIRECTORY: 'createNewDirectory',
  FROM_IPFS: 'fromIpfs',
  ADD_NEW_PEER: 'addNewPeer',
  UPDATE_API_SERVER_ADDRESS: 'updateApiServerAddress'
}

export const cliCommandList = {
  [cliCmdKeys.UPDATE_IPFS_CONFIG]: () => 'ipfs config replace <path-to-settings.json>',
  /**
   * @param {string} filePath
   */
  [cliCmdKeys.DELETE_FILE_FROM_IPFS]: (filePath) => `ipfs files rm -r "${filePath}"`,
  /**
   * @param {string} cid
   */
  [cliCmdKeys.DOWNLOAD_OBJECT_COMMAND]: (cid) => `ipfs get ${cid}`,
  /**
   * @param {string} cid
   * @param {string} op
   */
  [cliCmdKeys.PIN_OBJECT]: (cid, op) => `ipfs pin ${op} ${cid}`,
  /**
   * @param {string} filePath
   * @param {string} fileName
   */
  [cliCmdKeys.RENAME_IPFS_OBJECT]: (filePath, fileName) => {
    const prefix = filePath.replace(fileName, '').trim()
    return `ipfs files mv "${filePath}" "${prefix}<new-name>"`
  },
  [cliCmdKeys.ADD_FILE]: () => 'ipfs add <file-name>',
  [cliCmdKeys.ADD_DIRECTORY]: () => 'ipfs add -r <folder-name>',
  [cliCmdKeys.CREATE_NEW_DIRECTORY]: () => 'ipfs files mkdir <folder-name>',
  [cliCmdKeys.FROM_IPFS]: () => 'ipfs cp <content-path-or-cid> <dest-name>',
  [cliCmdKeys.ADD_NEW_PEER]: () => 'ipfs swarm connect <peer-multiaddr>',
  [cliCmdKeys.UPDATE_API_SERVER_ADDRESS]: () => 'ipfs config --json API.Addresses.API <custom-api-address>'
}
