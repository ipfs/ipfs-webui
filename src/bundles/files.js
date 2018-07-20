import { join, dirname } from 'path'
import fileReader from 'pull-file-reader'

const bundle = {
  name: 'files'
}

bundle.reducer = (state = null, action) => {
  if (action.type === 'FILES_FETCH_FINISHED') {
    return action.payload
  }

  return state
}

bundle.selectFiles = (state) => state.files

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

bundle.doFilesDelete = (files) => async ({ getIpfs }) => {
  const promises = files.map(file => getIpfs().files.rm(file, { recursive: true }))
  await Promise.all(promises)
}

bundle.doFilesMove = (from, to) => ({ getIpfs }) => {
  return getIpfs().files.mv([from, to])
}

bundle.doFilesCopy = (from, to) => ({ getIpfs }) => {
  return getIpfs().files.cp([from, to])
}

bundle.doFilesMakeDir = (path) => ({ getIpfs }) => {
  return getIpfs().files.mkdir(path, { parents: true })
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

bundle.doFilesWrite = (root, rawFiles, updateProgress) => async ({ getIpfs }) => {
  const { streams, totalSize } = await filesToStreams(rawFiles)
  updateProgress(0)

  let sent = 0

  for (const file of streams) {
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
  }

  console.log('HEY')
  updateProgress(100)
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
