import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { join, dirname } from 'path'
import fileReader from 'pull-file-reader'

const bundle = createAsyncResourceBundle({
  name: 'files',
  actionBaseType: 'FILES',
  getPromise: (args) => {
    const {store, getIpfs} = args
    let path = store.selectRouteParams().path

    if (!path) {
      store.doUpdateHash('/files/')
      return Promise.resolve()
    }

    path = decodeURIComponent(path)

    return getIpfs().files.stat(path)
      .then(stats => {
        if (stats.type === 'directory') {
          return getIpfs().files.ls(path, {l: true}).then((res) => {
            if (res) {
              res = res.map(file => {
                // FIX: open PR on js-ipfs-api
                file.type = file.type === 0 ? 'file' : 'directory'
                file.path = join(path, file.name)
                return file
              })
            }

            return {
              path: path,
              type: 'directory',
              files: res
            }
          })
        } else {
          stats.name = path

          return {
            path: path,
            type: 'file',
            stats: stats,
            read: () => getIpfs().files.read(path)
          }
        }
      })
  },
  staleAfter: Infinity,
  checkIfOnline: false
})

bundle.reactFilesFetch = createSelector(
  'selectFilesShouldUpdate',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectFiles',
  (shouldUpdate, ipfsReady, {url, params}, files) => {
    if (ipfsReady && url.startsWith('/files')) {
      if (shouldUpdate || !files || files.path !== decodeURIComponent(params.path)) {
        return { actionCreator: 'doFetchFiles' }
      }
    }
  }
)

bundle.doFilesDelete = (files) => ({dispatch, getIpfs, store}) => {
  dispatch({ type: 'FILES_DELETE_STARTED' })

  const promises = files.map(file => getIpfs().files.rm(file, { recursive: true }))
  Promise.all(promises)
    .then(() => {
      store.doFetchFiles()
      dispatch({ type: 'FILES_DELETE_FINISHED' })
    })
    .catch((error) => {
      dispatch({ type: 'FILES_DELETE_ERRORED', payload: error })
    })
}

function runAndFetch ({ dispatch, getIpfs, store }, type, action, args) {
  dispatch({ type: `${type}_STARTED` })

  return getIpfs().files[action](...args)
    .catch((error) => {
      dispatch({ type: `${type}_ERRORED`, payload: error })
    })
    .then(() => {
      dispatch({ type: `${type}_FINISHED` })
      return store.doMarkFilesAsOutdated()
    })
}

bundle.doFilesMove = (from, to) => (args) => {
  return runAndFetch(args, 'FILES_RENAME', 'mv', [[from, to]])
}

bundle.doFilesCopy = (from, to) => (args) => {
  return runAndFetch(args, 'FILES_RENAME', 'cp', [[from, to]])
}

bundle.doFilesMakeDir = (path) => (args) => {
  return runAndFetch(args, 'FILES_MKDIR', 'mkdir', [path, { parents: true }])
}

async function filesToStreams (files) {
  let toJoin = ''

  if (files.hasOwnProperty('dirContent') &&
    files.files.length === 1 &&
    files.files[0].type === '') {
    toJoin = files.files[0].name
    files = await files.dirContent
  } else if (files.hasOwnProperty('files')) {
    files = files.files
  }

  const streams = []
  let totalSize = 0
  let isDir = false

  for (let file of files) {
    const stream = fileReader(file)

    if (file.webkitRelativePath) {
      isDir = true
    }

    const name = file.webkitRelativePath || file.name

    streams.push({
      name: toJoin !== '' ? join(toJoin, name) : name,
      content: stream,
      size: file.size
    })

    totalSize += file.size
  }

  return { streams, totalSize, isDir }
}

bundle.doFilesWrite = (root, rawFiles, updateProgress) => async ({dispatch, getIpfs, store}) => {
  dispatch({ type: 'FILES_WRITE_STARTED' })

  try {
    const { streams, totalSize, isDir } = await filesToStreams(rawFiles)
    updateProgress(0)

    let sent = 0

    await Promise.all(streams.map(async file => {
      const dir = join(root, dirname(file.name))
      await getIpfs().files.mkdir(dir, { parents: true })
      let alreadySent = 0

      const res = await getIpfs().add(file.content, {
        pin: false,
        progress: (bytes) => {
          sent = sent + bytes - alreadySent
          alreadySent = bytes
          updateProgress(sent / totalSize * 100)
        }
      })

      const src = `/ipfs/${res[res.length - 1].hash}`
      const dst = join(root, file.name)
      await getIpfs().files.cp([src, dst])

      sent = sent - alreadySent + file.size
      updateProgress(sent / totalSize * 100)

      if (!isDir) {
        await store.doMarkFilesAsOutdated()
      }
    }))

    updateProgress(100)
    await store.doMarkFilesAsOutdated()
  } catch (error) {
    dispatch({ type: 'FILES_WRITE_ERRORED', payload: error })
  }
}

bundle.doFilesAddPath = (root, src) => async ({dispatch, getIpfs, store}) => {
  dispatch({ type: 'FILES_ADD_PATH_STARTED' })

  try {
    const name = src.split('/').pop()
    const dst = join(root, name)
    await getIpfs().files.cp([src, dst])
    await store.doFetchFiles()
  } catch (error) {
    dispatch({ type: 'FILES_ADD_PATH_ERRORED', payload: error })
  }
}

function downloadSingle (dispatch, store, file) {
  dispatch({ type: 'FILES_DOWNLOAD_LINK_STARTED' })

  let url, filename

  if (file.type === 'directory') {
    url = `${store.selectApiUrl()}/api/v0/get?arg=${file.hash}&archive=true&compress=true`
    filename = `${file.name}.tar.gz`
  } else {
    url = `${store.selectGatewayUrl()}/ipfs/${file.hash}`
    filename = file.name
  }

  return Promise.resolve({ url, filename })
}

function downloadMultiple (dispatch, getIpfs, store, files) {
  dispatch({ type: 'FILES_DOWNLOAD_LINK_STARTED' })

  const apiUrl = store.selectApiUrl()

  if (!apiUrl) {
    const e = new Error('api url undefined')
    dispatch({ type: 'FILES_DOWNLOAD_LINK_ERRORED', payload: e })
    return Promise.reject(e)
  }

  return getIpfs().object.new('unixfs-dir')
    .then(async (node) => {
      for (const file of files) {
        try {
          node = await getIpfs().object.patch.addLink(node.toJSON().multihash, {
            name: file.name,
            size: file.size,
            multihash: file.hash
          })
        } catch (e) {
          dispatch({ type: 'FILES_DOWNLOAD_LINK_ERRORED', payload: e })
          return Promise.reject(e)
        }
      }

      dispatch({ type: 'FILES_DOWNLOAD_LINK_FINISHED' })
      const multihash = node.toJSON().multihash

      return {
        url: `${apiUrl}/api/v0/get?arg=${multihash}&archive=true&compress=true`,
        filename: `download_${multihash}.tar.gz`
      }
    })
}

bundle.doFilesDownloadLink = (files) => ({dispatch, getIpfs, store}) => {
  if (files.length === 1) {
    return downloadSingle(dispatch, store, files[0])
  }

  return downloadMultiple(dispatch, getIpfs, store, files)
}

export default bundle
