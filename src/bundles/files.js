import { createSelector } from 'redux-bundler'
import { join, dirname } from 'path'
import fileReader from 'pull-file-reader'

const defaultState = {
  path: '/',
  type: 'directory',
  files: []
}

const bundle = {
  name: 'files'
}

bundle.reducer = (state = defaultState, action) => {
  if (action.type === 'FILES_FETCH_FINISHED') {
    return action.payload
  }

  return state
}

bundle.selectFiles = (state) => state.files

bundle.doFilesFetch = (path) => async ({ store, dispatch, getIpfs }) => {
  const ipfs = getIpfs()
  const stats = await ipfs.files.stat(path)

  if (stats.type === 'file') {
    stats.name = path

    dispatch({
      type: 'FILES_FETCH_FINISHED',
      payload: {
        path: path,
        type: 'file',
        stats: stats,
        read: () => ipfs.files.read(path)
      }
    })

    return
  }

  // Otherwise get the directory info
  let res = await ipfs.files.ls(path, {l: true})

  if (res) {
    res = res.map(file => {
      // FIX: open PR on js-ipfs-api
      file.type = file.type === 0 ? 'file' : 'directory'
      file.path = join(path, file.name)
      return file
    })
  }

  dispatch({
    type: 'FILES_FETCH_FINISHED',
    payload: {
      path: path,
      type: 'directory',
      files: res
    }
  })
}

bundle.doFilesDelete = (files) => async ({dispatch, getIpfs, store}) => {
  dispatch({ type: 'FILES_DELETE_STARTED' })

  const promises = files.map(file => getIpfs().files.rm(file, { recursive: true }))

  try {
    await Promise.all(promises)
    dispatch({ type: 'FILES_DELETE_FINISHED' })
    await store.doMarkFilesAsOutdated()
  } catch (error) {
    dispatch({ type: 'FILES_DELETE_ERRORED', payload: error })
  }
}

async function runAndFetch ({ dispatch, getIpfs, store }, type, action, args) {
  dispatch({ type: `${type}_STARTED` })

  try {
    await getIpfs().files[action](...args)
  } catch (error) {
    dispatch({ type: `${type}_ERRORED`, payload: error })
  } finally {
    dispatch({ type: `${type}_FINISHED` })
    await store.doFetchFiles()
  }
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
  if (files.hasOwnProperty('content')) {
    return files.content
  }

  const streams = []
  let totalSize = 0
  let isDir = false

  for (let file of files) {
    const stream = fileReader(file)

    if (file.webkitRelativePath) {
      isDir = true
    }

    streams.push({
      name: file.webkitRelativePath || file.name,
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

async function downloadSingle (dispatch, store, file) {
  dispatch({ type: 'FILES_DOWNLOAD_LINK_STARTED' })

  let url, filename

  if (file.type === 'directory') {
    url = `${store.selectApiUrl()}/api/v0/get?arg=${file.hash}&archive=true&compress=true`
    filename = `${file.name}.tar.gz`
  } else {
    url = `${store.selectGatewayUrl()}/ipfs/${file.hash}`
    filename = file.name
  }

  return { url, filename }
}

async function downloadMultiple (dispatch, getIpfs, store, files) {
  dispatch({ type: 'FILES_DOWNLOAD_LINK_STARTED' })

  const apiUrl = store.selectApiUrl()

  if (!apiUrl) {
    const e = new Error('api url undefined')
    dispatch({ type: 'FILES_DOWNLOAD_LINK_ERRORED', payload: e })
    return Promise.reject(e)
  }

  let node = await getIpfs().object.new('unixfs-dir')

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
}

bundle.doFilesDownloadLink = (files) => ({dispatch, getIpfs, store}) => {
  if (files.length === 1) {
    return downloadSingle(dispatch, store, files[0])
  }

  return downloadMultiple(dispatch, getIpfs, store, files)
}

export default bundle
