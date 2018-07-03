import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { join, dirname } from '../lib/path'

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
            // FIX: open PR on js-ipfs-api
            if (res) {
              res = res.map(file => {
                file.type = file.type === 0 ? 'file' : 'directory'
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
  staleAfter: 100,
  checkIfOnline: false
})

bundle.reactFilesFetch = createSelector(
  'selectFilesShouldUpdate',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectFiles',
  (shouldUpdate, ipfsReady, {url, params}, files) => {
    if (shouldUpdate && ipfsReady && url.startsWith('/files')) {
      if (!files || files.path !== params.path) {
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
      return store.doFetchFiles()
    })
}

bundle.doFilesRename = (from, to) => (args) => {
  return runAndFetch(args, 'FILES_RENAME', 'mv', [[from, to]])
}

bundle.doFilesCopy = (from, to) => (args) => {
  return runAndFetch(args, 'FILES_RENAME', 'cp', [[from, to]])
}

bundle.doFilesMakeDir = (path) => (args) => {
  return runAndFetch(args, 'FILES_MKDIR', 'mkdir', [path, { parents: true }])
}

function readAsBuffer (file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader()
    reader.onload = (event) => {
      resolve({
        content: Buffer.from(reader.result),
        name: file.webkitRelativePath || file.name
      })
    }
    reader.onerror = (event) => {
      reject(reader.error)
    }

    reader.readAsArrayBuffer(file)
  })
}

bundle.doFilesWrite = (root, files) => async ({dispatch, getIpfs, store}) => {
  dispatch({ type: 'FILES_WRITE_STARTED' })

  try {
    let promises = []

    for (const file of files) {
      promises.push(readAsBuffer(file))
    }

    files = await Promise.all(promises)

    for (const file of files) {
      const path = join(root, dirname(file.name))
      await getIpfs().files.mkdir(path, { parents: true })
    }

    await Promise.all(files.map(async file => {
      const res = await getIpfs().add([file.content])
      const f = res[res.length - 1]
      const src = `/ipfs/${f.hash}`
      const dst = join(root, file.name)
      await getIpfs().files.cp([src, dst])
    }))

    await store.doFetchFiles()
  } catch (error) {
    dispatch({ type: 'FILES_WRITE_ERRORED', payload: error })
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
