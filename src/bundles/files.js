import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'files',
  actionBaseType: 'FILES',
  getPromise: (args) => {
    const {store, getIpfs} = args
    const path = store.selectRouteParams().path

    if (!path) {
      store.doUpdateHash('/files/')
      return Promise.resolve()
    }

    return getIpfs().files.stat(path)
      .then(stat => {
        if (stat.type === 'directory') {
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
          return getIpfs().files.read(path).then(buf => {
            stat.content = buf

            return {
              path: path,
              type: 'file',
              file: stat
            }
          })
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

bundle.doFilesDelete = (files) => ({dispatch, getIpfs, store, ...args}) => {
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

export default bundle
