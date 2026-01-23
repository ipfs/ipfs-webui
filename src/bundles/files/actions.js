/* eslint-disable require-yield */

import { join, dirname, basename } from 'path'
import { getDownloadLink, getShareableLink, getCarLink } from '../../lib/files.js'
import countDirs from '../../lib/count-dirs.js'
import memoize from 'p-memoize'
import all from 'it-all'
import map from 'it-map'
import last from 'it-last'
import { CID } from 'multiformats/cid'

import { spawn, perform, send, ensureMFS, Channel, sortFiles, infoFromPath, dispatchAsyncProvide } from './utils.js'
import { IGNORED_FILES, ACTIONS } from './consts.js'

/**
 * @typedef {import('kubo-rpc-client').KuboRPCClient} IPFSService
 * @typedef {import('../../files/types').FileStream} FileStream
 * @typedef {import('./utils').Info} Info
 * @typedef {{ cid: CID }} Pin
 */

/**
 * @typedef {Object} FileStat
 * @property {number} size
 * @property {'directory'|'file'|'unknown'} type
 * @property {CID} cid
 * @property {string} name
 * @property {string} path
 * @property {string} parentPath
 * @property {boolean} pinned
 * @property {boolean|void} isParent
 *
 * @param {Object} stat
 * @param {'dir'|'directory'|'file'|'unknown'} stat.type
 * @param {CID} stat.cid
 * @param {string} stat.path
 * @param {number} [stat.cumulativeSize]
 * @param {number} stat.size
 * @param {string|void} [stat.name]
 * @param {boolean|void} [stat.pinned]
 * @param {boolean|void} [stat.isParent]
 * @param {string} [prefix]
 * @returns {FileStat}
 */
const fileFromStats = ({ cumulativeSize, type, size, cid, name, path, pinned, isParent }, prefix = '/ipfs') => {
  const pathParts = path.split('/')
  const pathFileName = pathParts.pop()
  const parentPath = pathParts.join('/') || '/'
  const file = {
    size: cumulativeSize || size || 0,
    type: type === 'dir' ? 'directory' : type,
    cid,
    name: name || pathFileName || cid.toString(),
    path: path || `${prefix}/${cid.toString()}`,
    parentPath,
    pinned: Boolean(pinned),
    isParent
  }
  return file
}

/**
 * @param {IPFSService} ipfs
 * @param {string|CID} cidOrPath
 * @returns {Promise<number>}
 */
const cumulativeSize = async (ipfs, cidOrPath) => {
  const { cumulativeSize } = await stat(ipfs, cidOrPath)
  return cumulativeSize || 0
}

/**
 * @param {string} path
 * @returns {string}
 */
// TODO: use sth else
export const realMfsPath = (path) => {
  if (path.startsWith('/files')) {
    return path.substring('/files'.length) || '/'
  }

  return path
}

const memStat = memoize((path, ipfs) => ipfs.files.stat(path))

/**
 * @typedef {Object} Stat
 * @property {string} path
 * @property {'file'|'directory'|'unknown'} type
 * @property {CID} cid
 * @property {number} cumulativeSize
 * @property {number} size
 * @property {string} [error]
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
    let stats
    if (path.startsWith('/ipfs/')) {
      stats = await memStat(path, ipfs)
    } else {
      stats = await ipfs.files.stat(path)
    }
    return { path, ...stats }
  } catch (/** @type {any} */ e) {
    // Mark DAG as 'unknown' to unblock listing other pins.
    // Clicking on 'unknown' entry will open it in Inspector.
    const [, , cid] = path.split('/')
    return {
      path: hashOrPath,
      cid: CID.asCID(cid) ?? CID.parse(cid),
      type: 'unknown',
      cumulativeSize: 0,
      size: 0,
      error: e.message
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
 * @typedef {import('./protocol').Message} Message
 * @typedef {import('./protocol').Model} Model

 * @typedef {import('./selectors').Selectors} Selectors
 * @typedef {import('../ipfs-provider').IPFSProviderStore} IPFSProviderStore
 * @typedef {import('../connected').Selectors} ConnectedSelectors
 *
 * @typedef {Object} ConfigSelectors
 * @property {function():string} selectApiUrl
 * @property {function():string} selectGatewayUrl
 * @property {function():string} selectPublicGateway
 * @property {function():string} selectPublicSubdomainGateway
 *
 * @typedef {Object} UnkonwActions
 * @property {function(string):Promise<unknown>} doUpdateHash
 * @typedef {Selectors & Actions & IPFSProviderStore & ConnectedSelectors & ConfigSelectors & UnkonwActions} Ext
 * @typedef {import('../ipfs-provider').Extra} Extra
 * @typedef {import('redux-bundler').Store<Model, Message, Ext>} Store
 * @typedef {import('redux-bundler').Context<Model, Message, Ext, Extra>} Context
 * @typedef {import('./protocol').PageContent} PageContent
 *
 * @typedef {import('redux-bundler').Actions<ReturnType<typeof actions>>} Actions
 *
 */

const actions = () => ({
  /**
   * Fetches list of pins and updates `state.pins` on successful completion.
   * @returns {function(Context):Promise<{pins: CID[]}>}
   */
  doPinsFetch: () => perform(ACTIONS.PIN_LIST, async (ipfs) => {
    const cids = await all(getPinCIDs(ipfs))

    return { pins: cids }
  }),

  /**
   * Syncs currently selected path file list.
   * @returns {function(Context):Promise<void>}
   */
  doFilesFetch: () => async ({ store }) => {
    const isReady = store.selectIpfsReady()
    const isConnected = store.selectIpfsConnected()
    const isFetching = store.selectFilesIsFetching()
    const info = store.selectFilesPathInfo()
    if (isReady && isConnected && !isFetching && info) {
      await store.doFetch(info)
    }
  },

  /**
   * Reads data from a CID with optional offset and length.
   * @param {import('multiformats/cid').CID} cid - The CID to read from
   * @param {number} [offset] - The starting point to read from
   * @param {number} [length] - The number of bytes to read
  */
  doRead: (cid, offset = 0, length) => perform(ACTIONS.READ_FILE, async (ipfs) => {
    if (!ipfs) {
      throw new Error('IPFS is not available')
    }
    return ipfs.cat(cid, { offset, length })
  }),

  /**
   * Fetches conten for the currently selected path. And updates
   * `state.pageContent` on succesful completion.
   * @param {Info} info
   * @returns {function(Context): *}
   */
  doFetch: ({ path, realPath, isMfs, isRoot }) => perform(ACTIONS.FETCH, async (ipfs, { store }) => {
    if (isRoot && !isMfs) {
      throw new Error('not supposed to be here')
    }

    let resolvedPath = realPath
    if (realPath.startsWith('/ipns/')) {
      try {
        // Extract IPNS name and any subpath
        // e.g., '/ipns/cid.ipfs.tech/subdir/file' -> name='cid.ipfs.tech', subpath='/subdir/file'
        const pathParts = realPath.slice('/ipns/'.length).split('/')
        const ipnsName = pathParts[0]
        const subpath = pathParts.length > 1 ? '/' + pathParts.slice(1).join('/') : ''

        // Resolve just the IPNS name
        const resolved = await last(ipfs.name.resolve(`/ipns/${ipnsName}`))
        // Append the subpath to the resolved CID path
        resolvedPath = resolved + subpath
      } catch (/** @type {any} */ error) {
        console.error(`Failed to resolve IPNS path "${realPath}":`, error)
        return {
          fetched: Date.now(),
          type: 'not-found',
          path: realPath,
          error: error.message
        }
      }
    }

    const time = Date.now()
    /** @type {Stat} */
    let stats
    try {
      stats = await stat(ipfs, resolvedPath)
    } catch (error) {
      console.error(`Error fetching stats for path "${resolvedPath}":`, error)
      return {
        fetched: time,
        type: 'not-found',
        path: resolvedPath
      }
    }

    switch (stats.type) {
      case 'unknown': {
        return {
          fetched: time,
          ...stats,
          path // Use original UI path, not resolved path from stats
        }
      }
      case 'file': {
        return {
          ...fileFromStats({ ...stats, path }),
          fetched: time,
          type: 'file',
          /**
          * Reads a portion of data from IPFS.
          * @param {number} offset - The starting point to read from.
          * @param {number} length - The number of bytes to read.
          * @returns {AsyncIterable<Uint8Array>} An async generator that yields the data read from IPFS.
          */
          read: (offset, length) => ipfs.cat(stats.cid, { offset, length }),
          name: path.split('/').pop(),
          size: stats.size,
          cid: stats.cid
        }
      }
      case 'directory': {
        try {
          return await dirStats(ipfs, stats.cid, {
            path,
            isRoot,
            sorting: store.selectFilesSorting()
          })
        } catch (/** @type {any} */ error) {
          console.error(`Failed to list directory "${path}":`, error)
          return {
            fetched: time,
            type: 'not-found',
            path,
            error: error.message
          }
        }
      }
      default: {
        throw Error(`Unsupported file type "${stats.type}"`)
      }
    }
  }),

  /**
   * Imports given `source` files to the provided `root` path. On completion
   * (success or fail) will trigger `doFilesFetch` to update the state.
   * @param {FileStream[]} source
   * @param {string} root
   */
  doFilesWrite: (source, root) => spawn(ACTIONS.WRITE, async function * (ipfs, { store }) {
    const files = source
      // Skip ignored files
      .filter($ => !IGNORED_FILES.includes(basename($.path)))
      // Dropped files come as absolute, those added by the file input come
      // as relative paths, so normalise all to be relative.
      .map($ => $.path[0] === '/' ? { ...$, path: $.path.slice(1) } : $)

    const totalSize = files.reduce((prev, { size }) => prev + size, 0)

    const entries = files.map(({ path, size }) => ({ path, size }))

    yield { entries, progress: 0 }

    const { result, progress } = importFiles(ipfs, files)

    /** @type {null|{uploaded:number, offset:number, name:string}} */
    let status = null

    for await (const { name, offset } of progress) {
      status = status == null
        ? { uploaded: 0, offset, name }
        : name === status.name
          ? { uploaded: status.uploaded, offset, name }
          : { uploaded: status.uploaded + status.offset, offset, name }
      const progress = (status.uploaded + status.offset) / totalSize * 100

      yield { entries, progress }
    }

    try {
      const added = await result

      const numberOfFiles = files.length
      const numberOfDirs = countDirs(files)
      const expectedResponseCount = numberOfFiles + numberOfDirs

      if (added.length !== expectedResponseCount) {
        // See https://github.com/ipfs/js-ipfs-api/issues/797
        throw Object.assign(new Error('API returned a partial response.'), {
          code: 'ERR_API_RESPONSE'
        })
      }

      for (const { path, cid } of added) {
        // Only go for direct children
        if (path.indexOf('/') === -1 && path !== '') {
          const src = `/ipfs/${cid}`
          const dst = join(realMfsPath(root || '/files'), path)

          try {
            await ipfs.files.cp(src, dst)
          } catch (err) {
            // TODO: Not sure why we do this. Perhaps a generic error is used
            // to avoid leaking private information via Countly?
            throw Object.assign(new Error('ipfs.files.cp call failed'), {
              code: 'ERR_FILES_CP_FAILED'
            })
          }
        }
      }

      yield { entries, progress: 100 }
      return entries
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Deletes `files` with provided paths. On completion (success sor fail) will
   * trigger `doFilesFetch` to update the state.
   * @param {Object} args
   * @param {FileStat[]} args.files
   * @param {boolean} args.removeLocally
   * @param {boolean} args.removeRemotely
   * @param {string[]} args.remoteServices
   */
  doFilesDelete: ({ files, removeLocally, removeRemotely, remoteServices }) => perform(ACTIONS.DELETE, async (ipfs, { store }) => {
    ensureMFS(store)

    if (files.length === 0) return undefined

    /**
     * Execute function asynchronously in a best-effort fashion.
     * We don't want any edge case (like a directory with multiple copies of
     * same file) to crash webui, nor want to bother user with false-negatives
     * @param {Function} fn
     */
    const tryAsync = async fn => { try { await fn() } catch (_) {} }

    try {
      // try removing from MFS first
      await Promise.all(
        files.map(async file => ipfs.files.rm(realMfsPath(file.path), {
          recursive: true
        }))
      )

      // Pin cleanup only if MFS removal was successful
      if (removeRemotely) {
        // remote unpin can be slow, so we do this async in best-effort fashion
        files.forEach(file => remoteServices.map(async service => tryAsync(() =>
          ipfs.pin.remote.rm({ cid: [file.cid], service })
        )))
      }

      if (removeLocally) {
        // removal of local pin can fail if same CID is present twice,
        // this is done in best-effort as well
        await Promise.all(files.map(async file => file.pinned && tryAsync(() =>
          ipfs.pin.rm(file.cid)
        )))
      }

      const src = files[0].path
      const path = src.slice(0, src.lastIndexOf('/'))
      await store.doUpdateHash(path)

      return undefined
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Adds file under the `src` path to the given `root` path. On completion will
   * trigger `doFilesFetch` to update the state.
   * @param {string} root
   * @param {string} src
   * @param {string} name
   */
  doFilesAddPath: (root, src, name = '') => perform(ACTIONS.ADD_BY_PATH, async (ipfs, { store }) => {
    ensureMFS(store)

    const path = realMfsPath(src)
    const cid = /** @type {string} */(path.split('/').pop())

    if (!name) {
      name = cid
    }

    const dst = realMfsPath(join(root, name))
    const srcPath = src.startsWith('/') ? src : `/ipfs/${cid}`

    try {
      return await ipfs.files.cp(srcPath, dst)
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Adds CAR file. On completion will trigger `doFilesFetch` to update the state.
   * @param {string} root
   * @param {FileStream} carFile
   * @param {string} name
   */
  doAddCarFile: (root, carFile, name = '') => perform(ACTIONS.ADD_CAR_FILE, async (/** @type {IPFSService} */ ipfs, { store }) => {
    ensureMFS(store)

    const stream = carFile.content.stream()
    try {
      // @ts-expect-error - https://github.com/ipfs/js-kubo-rpc-client/issues/278
      const result = await all(ipfs.dag.import(stream, {
        pinRoots: true
      }))
      const cid = result[0].root.cid
      const src = `/ipfs/${cid}`
      const dst = realMfsPath(join(root, name))
      let dstExists = false

      // Check if destination path already exists
      await ipfs.files.stat(dst).then(() => {
        dstExists = true
      }).catch(() => {
        // Swallow error. We can add the file to the dst path
      })

      if (dstExists) {
        throw new Error(`The name "${name}" already exists in the current directory. Try importing with a different name.`)
      }

      try {
        await ipfs.files.cp(src, dst)
      } catch (/** @type {any} */ err) {
        // TODO: Not sure why we do this. Perhaps a generic error is used
        // to avoid leaking private information via Countly?
        throw Object.assign(new Error('ipfs.files.cp call failed'), {
          code: 'ERR_FILES_CP_FAILED'
        })
      }
      return carFile
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Reads a text file containing CIDs and adds each one to IPFS at the given root path.
   * @param {FileStream[]} source - The text file containing CIDs
   * @param {string} root - Destination directory in IPFS
   */
  doFilesBulkCidImport: (source, root) => perform(ACTIONS.BULK_CID_IMPORT, async function (ipfs, { store }) {
    ensureMFS(store)

    if (!source?.[0]?.content) {
      console.error('Invalid file format provided to doFilesBulkCidImport')
      return
    }

    try {
      const file = source[0]
      const content = await new Response(file.content).text()
      const lines = content.split('\n').map(line => line.trim()).filter(Boolean)

      const cidObjects = lines.map((line) => {
        let actualCid = line
        let name = line
        const cidParts = line.split(' ')
        if (cidParts.length > 1) {
          actualCid = cidParts[0]
          name = cidParts.slice(1).join(' ')
        }
        return {
          name,
          cid: actualCid
        }
      })

      for (const { cid, name } of cidObjects) {
        try {
          const src = `/ipfs/${cid}`
          const dst = realMfsPath(join(root || '/files', name || cid))

          await ipfs.files.cp(src, dst)
        } catch (err) {
          console.error(`Failed to add CID ${cid}:`, err)
        }
      }
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Creates a download link for the provided files.
   * @param {FileStat[]} files
   */
  doFilesDownloadLink: (files) => perform(ACTIONS.DOWNLOAD_LINK, async (ipfs, { store }) => {
    const gatewayUrl = store.selectGatewayUrl()
    return getDownloadLink(files, gatewayUrl, ipfs)
  }),

  /**
   * Creates a download link for the DAG CAR.
   * @param {FileStat[]} files
   */
  doFilesDownloadCarLink: (files) => perform(ACTIONS.DOWNLOAD_LINK, async (ipfs, { store }) => {
    const gatewayUrl = store.selectGatewayUrl()
    return getCarLink(files, gatewayUrl, ipfs)
  }),

  /**
   * Triggers provide operation for a CID.
   * @param {import('multiformats/cid').CID} cid
   */
  doFilesCidProvide: (cid) => perform('FILES_CID_PROVIDE', async (ipfs) => {
    dispatchAsyncProvide(cid, ipfs)
  }),

  doFilesShareLink: (/** @type {FileStat[]} */ files) => perform(ACTIONS.SHARE_LINK, async (ipfs, { store }) => {
    // ensureMFS deliberately omitted here, see https://github.com/ipfs/ipfs-webui/issues/1744 for context.
    const publicGateway = store.selectPublicGateway()
    const publicSubdomainGateway = store.selectPublicSubdomainGateway()
    const { link: shareableLink, cid } = await getShareableLink(files, publicGateway, publicSubdomainGateway, ipfs)

    // Trigger background provide operation with the CID from getShareableLink
    dispatchAsyncProvide(cid, ipfs)

    return shareableLink
  }),

  /**
   * Moves file from `src` MFS path to a `dst` MFS path. On completion (success
   * or fail) triggers `doFilesFetch` to update the state.
   * @param {string} src
   * @param {string} dst
   */
  doFilesMove: (src, dst) => perform(ACTIONS.MOVE, async (ipfs, { store }) => {
    ensureMFS(store)

    try {
      await ipfs.files.mv(realMfsPath(src), realMfsPath(dst))

      const page = store.selectFiles()
      const pagePath = page && page.path
      if (src === pagePath) {
        await store.doUpdateHash(dst)
      }
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Copies file from `src` MFS path to a `dst` MFS path. On completion (success
   * or fail) triggers `doFilesFetch` to update the state.
  * @param {string} src
  * @param {string} dst
  */
  doFilesCopy: (src, dst) => perform(ACTIONS.COPY, async (ipfs, { store }) => {
    ensureMFS(store)

    try {
      await ipfs.files.cp(realMfsPath(src), realMfsPath(dst))
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Creates a directory at given MFS `path`. On completion (success or fail)
   * triggers `doFilesFetch` to update the state.
   * @param {string} path
   */
  doFilesMakeDir: (path) => perform(ACTIONS.MAKE_DIR, async (ipfs, { store }) => {
    ensureMFS(store)

    try {
      await ipfs.files.mkdir(realMfsPath(path), {
        parents: true
      })
    } finally {
      await store.doFilesFetch()
    }
  }),

  /**
   * Pins given `cid`. On completion (success or fail) triggers `doPinsFetch` to
   * update the state.
   * @param {CID} cid
   */
  doFilesPin: (cid) => perform(ACTIONS.PIN_ADD, async (ipfs, { store }) => {
    try {
      return await ipfs.pin.add(cid)
    } finally {
      await store.doPinsFetch()
    }
  }),

  /**
   * Unpins given `cid`. On completion (success or fail) triggers `doPinsFetch`
   * to update the state.
   * @param {CID} cid
   */
  doFilesUnpin: (cid) => perform(ACTIONS.PIN_REMOVE, async (ipfs, { store }) => {
    try {
      return await ipfs.pin.rm(cid)
    } finally {
      await store.doPinsFetch()
    }
  }),

  /**
   * Clears all failed tasks.
   */
  doFilesDismissErrors: () => send({ type: ACTIONS.DISMISS_ERRORS }),

  /**
   * @param {Object} fileArgs
   * @param {string} fileArgs.path
   * @param {string|CID} fileArgs.cid
  */
  doFilesNavigateTo: ({ path, cid }) =>
    /**
     * @param {Context} context
     */
    async ({ store }) => {
      try {
        const link = path.split('/').map(p => encodeURIComponent(p)).join('/')
        const files = store.selectFiles()
        const url = store.selectFilesPathInfo()

        if (files && files.path === link && url) {
          await store.doFilesFetch()
        } else {
          await store.doUpdateHash(link)
        }
      } catch (e) {
        console.error(e)
        store.doUpdateHash(`/ipfs/${cid}`)
      }
    },

  /**
   * @param {import('./consts').SORTING} by
   * @param {boolean} asc
   */
  doFilesUpdateSorting: (by, asc) => send({
    type: ACTIONS.UPDATE_SORT,
    payload: { by, asc }
  }),

  /**
   * Clears all the tasks (pending, complete and failed).
   */
  doFilesClear: () => send({ type: ACTIONS.CLEAR_ALL }),

  /**
   * Gets size of the MFS. On successful completion `state.mfsSize` will get
   * updated.
   */
  doFilesSizeGet: () => perform(ACTIONS.SIZE_GET, async (ipfs) => {
    return { size: await cumulativeSize(ipfs, '/') }
  }),

  /**
   * @param {string|CID} cid
  */
  doGetFileSizeThroughCid: (cid) =>
    /**
     * @param {Object} store
     * @param {Function} store.getIpfs
    */
    async (store) => {
      const ipfs = store.getIpfs()
      return cumulativeSize(ipfs, cid)
    }
})

export default actions
/**
 *
 * @param {IPFSService} ipfs
 * @param {FileStream[]} files
 */
const importFiles = (ipfs, files) => {
  /** @type {Channel<{ offset:number, name: string}>} */
  const channel = new Channel()
  const result = all(ipfs.addAll(files, {
    pin: false,
    wrapWithDirectory: false,
    progress: (offset, name = '') => channel.send({ offset, name })
  }))

  result.then(() => channel.close(), error => channel.close(error))

  return { result, progress: channel }
}

/**
 * @param {IPFSService} ipfs
 * @param {CID} cid
 * @param {Object} options
 * @param {string} options.path
 * @param {boolean} [options.isRoot]
 * @param {import('./utils').Sorting} options.sorting
 * @returns {Promise<import('./protocol').DirectoryContent>}
 */
const dirStats = async (ipfs, cid, { path, isRoot, sorting }) => {
  const entries = await all(ipfs.ls(cid)) || []
  // Workarounds regression in IPFS HTTP Client that causes
  // ls on empty dir to return list with that dir only.
  // @see https://github.com/ipfs/js-ipfs/issues/3566
  const res = (entries.length === 1 && entries[0].cid.toString() === cid.toString())
    ? []
    : entries
  const files = []

  // precaution: there was a historical performance issue when too many dirs were present
  let dirCount = 0

  for (const f of res) {
    const absPath = join(path, f.name)
    let file = null

    if (dirCount < 1000 && f.type === 'dir') {
      dirCount += 1
      file = fileFromStats({ ...await stat(ipfs, f.cid), path: absPath })
    } else {
      file = fileFromStats({ ...f, path: absPath })
    }

    files.push(file)
  }

  let parent = null
  let parentPathForDir = '/'

  if (!isRoot) {
    const parentPath = dirname(path)
    const parentInfo = infoFromPath(parentPath, false)

    if (parentInfo && (parentInfo.isMfs || !parentInfo.isRoot)) {
      const realPath = parentInfo.realPath

      if (realPath && realPath.startsWith('/ipns')) {
        try {
          parentInfo.realPath = await last(ipfs.name.resolve(parentInfo.realPath))
        } catch (error) {
          // Failed to resolve parent IPNS path, skip parent link
          console.error(`Failed to resolve parent IPNS path "${parentInfo.realPath}":`, error)
        }
      }

      if (parentInfo.realPath) {
        parent = fileFromStats({
          ...await stat(ipfs, parentInfo.realPath),
          path: parentInfo.path,
          name: '..',
          isParent: true
        })
        parentPathForDir = parentInfo.path
      }
    }
  }

  return {
    path,
    parentPath: parentPathForDir,
    fetched: Date.now(),
    type: 'directory',
    cid,
    upper: parent,
    content: sortFiles(files, sorting)
  }
}
