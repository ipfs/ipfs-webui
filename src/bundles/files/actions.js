import { join, dirname, basename } from 'path'
import { getDownloadLink, getShareableLink } from '../../lib/files'
import countDirs from '../../lib/count-dirs'

import { make, sortFiles, infoFromPath } from './utils'
import { IGNORED_FILES, ACTIONS } from './consts'

const fileFromStats = ({ cumulativeSize, type, size, hash, name }, path) => ({
  size: cumulativeSize || size || null,
  type: (type === 'dir' || type === 'directory') ? 'directory' : 'file',
  hash: hash,
  name: name || path ? path.split('/').pop() : hash,
  path: path || `/ipfs/${hash}`
})

// TODO: use sth else
const realMfsPath = (path) => {
  if (path.startsWith('/files')) {
    return path.substr('/files'.length) || '/'
  }

  return path
}

const getRawPins = async (ipfs) => {
  const recursive = await ipfs.pin.ls({ type: 'recursive' })
  const direct = await ipfs.pin.ls({ type: 'direct' })

  return recursive.concat(direct)
}

const getPins = async (ipfs) => {
  const pins = await getRawPins(ipfs)

  const promises = pins
    .map(({ hash }) => ipfs.files.stat(`/ipfs/${hash}`))
  const stats = await Promise.all(promises)

  return stats.map(item => {
    item = fileFromStats(item)
    item.pinned = true
    return item
  })
}

const fetchFiles = make(ACTIONS.FETCH, async (ipfs, id, { store }) => {
  let { path, realPath, isMfs, isPins, isRoot } = store.selectFilesPathInfo()

  if (isRoot && !isMfs && !isPins) {
    throw new Error('not supposed to be here')
  }

  if (isRoot && isPins) {
    const pins = await getPins(ipfs) // FIX: pins path

    return {
      path: '/pins',
      fetched: Date.now(),
      type: 'directory',
      content: pins
    }
  }

  if (realPath.startsWith('/ipns')) {
    realPath = await ipfs.name.resolve(realPath)
  }

  const stats = await ipfs.files.stat(realPath)

  if (stats.type === 'file') {
    return {
      ...fileFromStats(stats, path),
      fetched: Date.now(),
      type: 'file',
      read: () => ipfs.cat(stats.hash),
      name: path.split('/').pop(),
      size: stats.size,
      hash: stats.hash
    }
  }

  // Otherwise get the directory info
  const res = await ipfs.ls(stats.hash) || []
  const files = []
  const showStats = res.length < 100

  for (const f of res) {
    const absPath = join(path, f.name)
    let file = null

    if (showStats && f.type === 'dir') {
      file = fileFromStats(await ipfs.files.stat(`/ipfs/${f.hash}`), absPath)
    } else {
      file = fileFromStats(f, absPath)
    }

    files.push(file)
  }

  let parent = null

  if (!isRoot) {
    const parentPath = dirname(path)
    const parentInfo = infoFromPath(parentPath)
    
    if (parentInfo.isMfs || !parentInfo.isRoot) {
      if (parentInfo.realPath.startsWith('/ipns')) {
        parentInfo.realPath = await ipfs.name.resolve(parentInfo.realPath)
      }

      console.log(parentInfo.realPath)
      parent = fileFromStats(await ipfs.files.stat(parentInfo.realPath))

      parent.name = '..'
      parent.path = parentInfo.path
      parent.isParent = true
    }
  }

  return {
    path: path,
    fetched: Date.now(),
    type: 'directory',
    hash: stats.hash,
    upper: parent,
    content: sortFiles(files, store.selectFilesSorting())
  }
})

export default () => ({
  doPinsFetch: make(ACTIONS.PIN_LIST, async (ipfs, id, { dispatch }) => {
    const recursive = await ipfs.pin.ls({ type: 'recursive' })
    const direct = await ipfs.pin.ls({ type: 'direct' })

    return { pins: recursive.concat(direct).map(f => f.hash) }
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

    const updateProgress = (sent) => {
      dispatch({ type: 'FILES_WRITE_UPDATED', payload: { id: id, progress: sent / totalSize * 100 } })
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
      throw Object.assign(new Error(`API returned a partial response.`), { code: 'ERR_API_RESPONSE' })
    }

    for (const { path, hash } of res) {
      // Only go for direct children
      if (path.indexOf('/') === -1 && path !== '') {
        const src = `/ipfs/${hash}`
        const dst = join(realMfsPath(root), path)

        try {
          await ipfs.files.cp([src, dst])
        } catch (err) {
          throw Object.assign(new Error(`Folder already exists.`), { code: 'ERR_FOLDER_EXISTS' })
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

  doFilesPin: make(ACTIONS.PIN_ADD, (ipfs, hash) => ipfs.pin.add(hash)),

  doFilesUnpin: make(ACTIONS.PIN_REMOVE, (ipfs, hash) => ipfs.pin.rm(hash)),

  doFilesDismissErrors: () => async ({ dispatch }) => dispatch({ type: 'FILES_DISMISS_ERRORS' }),

  doFilesNavigateTo: (path) => async ({ store }) => {
    const link = path.split('/').map(p => encodeURIComponent(p)).join('/')
    const files = store.selectFiles()

    if (files && files.path === link) {
      store.doFilesFetch()
    } else {
      store.doUpdateHash(`${link}`)
    }
  },

  doFilesUpdateSorting: (by, asc) => async ({ dispatch }) => {
    dispatch({ type: 'FILES_UPDATE_SORT', payload: { by, asc } })
  }
})
