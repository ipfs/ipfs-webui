import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { join } from '../lib/path'

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
        name: file.name
      })
    }
    reader.onerror = (event) => {
      reject(reader.error)
    }

    reader.readAsArrayBuffer(file)
  })
}

bundle.doFilesWrite = (root, files) => ({dispatch, getIpfs, store}) => {
  dispatch({ type: 'FILES_WRITE_STARTED' })

  let promises = []

  for (const file of files) {
    promises.push(readAsBuffer(file))
  }

  return Promise.all(promises).then(files => {
    return Promise.all(files.map((file) => {
      const target = join(root, file.name)
      return getIpfs().files.write(target, file.content, { create: true })
    }))
  }).then(() => {
    store.doFetchFiles()
    dispatch({ type: 'FILES_WRITE_FINISHED' })
  }).catch((error) => {
    dispatch({ type: 'FILES_WRITE_ERRORED', payload: error })
  })
}

export default bundle
