import { join, dirname } from 'path'
import fileReader from 'pull-file-reader'

function uuid () {
  var uuid = ''
  var i
  var random
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0

    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16)
  }
  return uuid
}

const defaultState = {
  data: null,
  error: null,
  actions: {
    move: [],
    copy: [],
    delete: [],
    download: [],
    write: []
  }
}

const patterns = {
  started: /^FILES_(\w+)_STARTED$/,
  failed: /^FILES_(\w+)_FAILED$/,
  finished: /^FILES_(\w+)_FINISHED$/,
  updated: /^FILES_(\w+)_UPDATED$/
}

const bundle = {
  name: 'files',

  reducer: (state = defaultState, action) => {
    if (action.type === 'FILES_FETCH_FINISHED') {
      return {
        ...state,
        data: action.payload
      }
    }

    let match

    match = action.type.match(patterns.started)
    if (match) {
      const field = match[1].toLowerCase()
      const { id, ...data } = action.payload

      return {
        ...state,
        actions: {
          ...state.actions,
          [field]: {
            ...state.actions[field],
            [id]: {
              ...data,
              type: field,
              status: 'started',
              start: Date.now()
            }
          }
        },
        error: action.payload
      }
    }

    match = action.type.match(patterns.failed)
    if (match) {
      const field = match[1].toLowerCase()
      const { id, error } = action.payload

      return {
        ...state,
        error: error,
        actions: {
          ...state.actions,
          [field]: {
            ...state.actions[field],
            [id]: {
              ...state.actions[field][id],
              end: Date.now(),
              status: 'failed',
              error: error
            }
          }
        }
      }
    }

    match = action.type.match(patterns.finished)
    if (match) {
      const field = match[1].toLowerCase()
      const { id, ...data } = action.payload

      return {
        ...state,
        actions: {
          ...state.actions,
          [field]: {
            ...state.actions[field],
            [id]: {
              ...state.actions[field][id],
              ...data,
              end: Date.now(),
              status: 'finished'
            }
          }
        },
        error: action.payload
      }
    }

    return state
  }
}

bundle.selectFiles = (state) => state.files.data

bundle.doFilesFetch = (path) => async ({ dispatch, getIpfs }) => {
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

const makeAction = (basename, action) => (...args) => async ({ dispatch, getIpfs }) => {
  const id = uuid()
  dispatch({ type: `FILES_${basename}_STARTED`, payload: { id } })

  try {
    await action(getIpfs(), ...args)
    dispatch({ type: `FILES_${basename}_FINISHED`, payload: { id } })
  } catch (e) {
    dispatch({ type: `FILES_${basename}_FAILED`, payload: { id, error: e } })
  } finally {

  }
}

bundle.doFilesDelete = makeAction('DELETE', (ipfs, files) => {
  const promises = files.map(file => ipfs.files.rm(file, { recursive: true }))
  return Promise.all(promises)
})

bundle.doFilesMove = makeAction('MOVE', (ipfs, src, dst) => ipfs.files.mv([src, dst]))

bundle.doFilesCopy = makeAction('COPY', (ipfs, src, dst) => ipfs.files.cp([src, dst]))

bundle.doFilesMakeDir = makeAction('MKDIR', (ipfs, path) => ipfs.files.mkdir(path, { parents: true }))

function filesToStreams (files) {
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

bundle.doFilesWrite = (root, rawFiles) => async ({ getIpfs, dispatch }) => {
  const { streams, totalSize } = filesToStreams(rawFiles)

  const updateProgress = (progress) => {
    dispatch({ type: 'FILES_WRITE_PROGRESS', payload: { progress } })
  }

  dispatch({ type: 'FILES_WRITE_STARTED' })
  updateProgress(0)

  let sent = 0

  for (const file of streams) {
    const dir = join(root, dirname(file.name))
    await getIpfs().files.mkdir(dir, { parents: true })
    let alreadySent = 0

    const res = await getIpfs().add(file.content, {
      pin: false,
      // eslint-disable-next-line
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
  }

  updateProgress(100)

  dispatch({ type: 'FILES_WRITE_FINISHED' })
}

bundle.doFilesAddPath = (root, src) => async ({ getIpfs }) => {
  const name = src.split('/').pop()
  const dst = join(root, name)
  await getIpfs().files.cp([src, dst])
}

async function downloadSingle (store, file) {
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

async function downloadMultiple (getIpfs, store, files) {
  const apiUrl = store.selectApiUrl()

  if (!apiUrl) {
    const e = new Error('api url undefined')
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
      return Promise.reject(e)
    }
  }

  const multihash = node.toJSON().multihash

  return {
    url: `${apiUrl}/api/v0/get?arg=${multihash}&archive=true&compress=true`,
    filename: `download_${multihash}.tar.gz`
  }
}

bundle.doFilesDownloadLink = (files) => ({ getIpfs, store }) => {
  if (files.length === 1) {
    return downloadSingle(store, files[0])
  }

  return downloadMultiple(getIpfs, store, files)
}

export default bundle
