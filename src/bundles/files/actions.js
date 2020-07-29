// @ts-check

import { join, dirname, basename } from 'path'
import { getDownloadLink, getShareableLink } from '../../lib/files'
import countDirs from '../../lib/count-dirs'
import all from 'it-all'
import map from 'it-map'
import last from 'it-last'
import CID from 'cids'

import { make, sortFiles, infoFromPath } from './utils'
import { IGNORED_FILES, ACTIONS } from './consts'

/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {import('ipfs').Pin} Pin
 */

/**
 * @typedef {Object} FileStat
 * @property {number|null} size
 * @property {'directory'|'file'|'unknown'} type
 * @property {CID} cid
 * @property {string} name
 * @property {string} path
 * @property {boolean} pinned
 * @property {boolean|void} isParent
 *
 * @param {Object} stat
 * @param {'dir'|'directory'|'file'|'unknown'} stat.type
 * @param {CID} stat.cid
 * @param {string} stat.path
 * @param {number} [stat.cumulativeSize]
 * @param {number} [stat.size]
 * @param {string|void} [stat.name]
 * @param {boolean|void} [stat.pinned]
 * @param {boolean|void} [stat.isParent]
 * @param {string} [prefix]
 * @returns {FileStat}
 */
const fileFromStats = ({ cumulativeSize, type, size, cid, name, path, pinned, isParent }, prefix = '/ipfs') => ({
  size: cumulativeSize || size || null,
  type: (type === 'dir' || type === 'directory') ? 'directory' : (type === 'unknown') ? 'unknown' : 'file',
  cid,
  name: name || path.split('/').pop() || cid.toString(),
  path: path || `${prefix}/${cid.toString()}`,
  pinned: Boolean(pinned),
  isParent: isParent
})

// TODO: use sth else
const realMfsPath = (path) => {
  if (path.startsWith('/files')) {
    return path.substr('/files'.length) || '/'
  }

  return path
}

/**
 * @typedef {Object} Stat
 * @property {string} path
 * @property {'file'|'directory'|'unknown'} type
 * @property {CID} cid
 * @property {number|null} size
 *
 * @param {IPFSService} ipfs
 * @param {string|CID} cidOrPath
 * @returns {Promise<Stat>}
 */
const stat = async (ipfs, cidOrPath) => {
  const hashOrPath = cidOrPath.toString()
  const path = hashOrPath.startsWith('/')
    ? hashOrPath
    : `/ipfs/${hashOrPath}`

  try {
    const stats = await ipfs.files.stat(path)
    return { path, ...stats }
  } catch (e) {
    // Discard error and mark DAG as 'unknown' to unblock listing other pins.
    // Clicking on 'unknown' entry will open it in Inspector.
    // No information is lost: if there is an error related
    // to specified hashOrPath user will read it in Inspector.
    const [, , cid] = path.split('/')
    return {
      path: hashOrPath,
      cid: new CID(cid),
      type: 'unknown',
      size: null
    }
  }
}

/**
 *
 * @param {IPFSService} ipfs
 * @returns {AsyncIterable<Pin>}
 */
const getRawPins = async function * (ipfs) {
  yield * ipfs.pin.ls({ type: 'recursive' })
  yield * ipfs.pin.ls({ type: 'direct' })
}

/**
 * @param {IPFSService} ipfs
 * @returns {AsyncIterable<CID>}
 */
const getPinCIDs = (ipfs) => map(getRawPins(ipfs), (pin) => pin.cid)

/**
 * @param {IPFSService} ipfs
 * @returns {AsyncIterable<FileStat>}
 */
const getPins = async function * (ipfs) {
  for await (const cid of getPinCIDs(ipfs)) {
    const info = await stat(ipfs, cid)
    yield fileFromStats({ ...info, pinned: true }, '/pins')
  }
}

/**
 * @typedef {Object} FetchFilesResult
 * @property {string} path
 * @property {Date} fetched
 * @property {'directory'} type
 * @property {FileStat[]} content
 *
 * @param {IPFSService} ipfs
 * @param {*} id
 * @param {*} options
 */
const fetchFilesFX = async (ipfs, id, { store }) => {
  let { path, realPath, isMfs, isPins, isRoot } = store.selectFilesPathInfo()

  if (isRoot && !isMfs && !isPins) {
    throw new Error('not supposed to be here')
  }

  if (isRoot && isPins) {
    const pins = await all(getPins(ipfs)) // FIX: pins path

    return {
      path: '/pins',
      fetched: Date.now(),
      type: 'directory',
      content: pins
    }
  }

  if (realPath.startsWith('/ipns')) {
    realPath = await last(ipfs.name.resolve(realPath))
  }

  const stats = await stat(ipfs, realPath)

  if (stats.type === 'unknown') {
    return stats
  }

  if (stats.type === 'file') {
    return {
      ...fileFromStats({ ...stats, path }),
      fetched: Date.now(),
      type: 'file',
      read: () => ipfs.cat(stats.cid),
      name: path.split('/').pop(),
      size: stats.size,
      cid: stats.cid
    }
  }

  // Otherwise get the directory info
  const res = await all(ipfs.ls(stats.cid)) || []
  const files = []
  const showStats = res.length < 100

  for (const f of res) {
    const absPath = join(path, f.name)
    let file = null

    if (showStats && f.type === 'directory') {
      file = fileFromStats({ ...await stat(ipfs, f.cid), path: absPath })
    } else {
      file = fileFromStats({ ...f, path: absPath })
    }

    files.push(file)
  }

  let parent = null

  if (!isRoot) {
    const parentPath = dirname(path)
    const parentInfo = infoFromPath(parentPath, false)

    if (parentInfo.isMfs || !parentInfo.isRoot) {
      if (parentInfo.realPath.startsWith('/ipns')) {
        parentInfo.realPath = await ipfs.name.resolve(parentInfo.realPath)
      }

      parent = fileFromStats({
        ...await ipfs.files.stat(parentInfo.realPath),
        path: parentInfo.path,
        name: '..',
        isParent: true
      })
    }
  }

  return {
    path: path,
    fetched: Date.now(),
    type: 'directory',
    cid: stats.cid,
    upper: parent,
    content: sortFiles(files, store.selectFilesSorting())
  }
}

const fetchFiles = make(ACTIONS.FETCH, fetchFilesFX)

export default () => ({
  doPinsFetch: make(ACTIONS.PIN_LIST, async (ipfs) => {
    const cids = await all(getPinCIDs(ipfs))
    return { pins: cids }
  }),

  doFilesFetch: () => async ({ store, ...args }) => {
    const isReady = store.selectIpfsReady()
    const isConnected = store.selectIpfsConnected()
    const isFetching = store.selectFilesIsFetching()
    const info = store.selectFilesPathInfo()

    if (isReady && isConnected && !isFetching && info) {
      fetchFiles()({ store, ...args })
    }
  },

  doFilesWrite: make(ACTIONS.WRITE, async (ipfs, files, root, id, { dispatch }) => {
    files = files.filter(f => !IGNORED_FILES.includes(basename(f.path)))
    const totalSize = files.reduce((prev, { size }) => prev + size, 0)

    // Normalise all paths to be relative. Dropped files come as absolute,
    // those added by the file input come as relative paths, so normalise them.
    files.forEach(s => {
      if (s.path[0] === '/') {
        s.path = s.path.slice(1)
      }
    })

    const paths = files.map(f => ({ path: f.path, size: f.size }))

    const updateProgress = (sent) => {
      dispatch({
        type: 'FILES_WRITE_UPDATED',
        payload: {
          id,
          paths,
          progress: sent / totalSize * 100
        }
      })
    }

    updateProgress(0)

    let res = null
    try {
      res = await ipfs.add(files, {
        pin: false,
        wrapWithDirectory: false,
        progress: updateProgress
      })
    } catch (error) {
      console.error(error)
      throw error
    }

    const numberOfFiles = files.length
    const numberOfDirs = countDirs(files)
    const expectedResponseCount = numberOfFiles + numberOfDirs

    if (res.length !== expectedResponseCount) {
      // See https://github.com/ipfs/js-ipfs-api/issues/797
      throw Object.assign(new Error('API returned a partial response.'), { code: 'ERR_API_RESPONSE' })
    }

    for (const { path, cid } of res) {
      // Only go for direct children
      if (path.indexOf('/') === -1 && path !== '') {
        const src = `/ipfs/${cid}`
        const dst = join(realMfsPath(root || '/files'), path)

        try {
          await ipfs.files.cp([src, dst])
        } catch (err) {
          throw Object.assign(new Error('Folder already exists.'), { code: 'ERR_FOLDER_EXISTS' })
        }
      }
    }

    updateProgress(totalSize)
  }),

  doFilesDelete: make(ACTIONS.DELETE, (ipfs, files) => {
    const promises = files.map(file => ipfs.files.rm(realMfsPath(file), { recursive: true }))
    return Promise.all(promises)
  }, { mfsOnly: true }),

  doFilesAddPath: make(ACTIONS.ADD_BY_PATH, (ipfs, root, src) => {
    src = realMfsPath(src)
    const name = src.split('/').pop()
    const dst = realMfsPath(join(root, name))
    const srcPath = src.startsWith('/') ? src : `/ipfs/${name}`

    return ipfs.files.cp([srcPath, dst])
  }, { mfsOnly: true }),

  doFilesDownloadLink: make(ACTIONS.DOWNLOAD_LINK, async (ipfs, files, id, { store }) => {
    const apiUrl = store.selectApiUrl()
    const gatewayUrl = store.selectGatewayUrl()
    return getDownloadLink(files, gatewayUrl, apiUrl, ipfs)
  }),

  doFilesShareLink: make(ACTIONS.SHARE_LINK, async (ipfs, files) => getShareableLink(files, ipfs)),

  doFilesMove: make(ACTIONS.MOVE, (ipfs, src, dst) => ipfs.files.mv([realMfsPath(src), realMfsPath(dst)]), { mfsOnly: true }),

  doFilesCopy: make(ACTIONS.COPY, (ipfs, src, dst) => ipfs.files.cp([realMfsPath(src), realMfsPath(dst)]), { mfsOnly: true }),

  doFilesMakeDir: make(ACTIONS.MAKE_DIR, (ipfs, path) => ipfs.files.mkdir(realMfsPath(path), { parents: true }), { mfsOnly: true }),

  doFilesPin: make(ACTIONS.PIN_ADD, (ipfs, cid) => ipfs.pin.add(cid)),

  doFilesUnpin: make(ACTIONS.PIN_REMOVE, (ipfs, cid) => ipfs.pin.rm(cid)),

  doFilesDismissErrors: () => async ({ dispatch }) => dispatch({ type: 'FILES_DISMISS_ERRORS' }),

  doFilesNavigateTo: (path) => async ({ store }) => {
    const link = path.split('/').map(p => encodeURIComponent(p)).join('/')
    const files = store.selectFiles()
    const url = store.selectFilesPathInfo()

    if (files && files.path === link && url) {
      store.doFilesFetch()
    } else {
      store.doUpdateHash(`${link}`)
    }
  },

  doFilesUpdateSorting: (by, asc) => async ({ dispatch }) => {
    dispatch({ type: 'FILES_UPDATE_SORT', payload: { by, asc } })
  },

  doFilesClear: () => async ({ dispatch }) => dispatch({ type: 'FILES_CLEAR_ALL' }),

  doFilesSizeGet: make(ACTIONS.FILES_SIZE_GET, async (ipfs) => {
    const stat = await ipfs.files.stat('/')
    return { size: stat.cumulativeSize }
  })
})
