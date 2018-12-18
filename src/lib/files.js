import fileReader from 'pull-file-reader'
import CID from 'cids'

const ignore = [
  '.DS_Store',
  'thumbs.db',
  'desktop.ini'
]

export async function filesToStreams (files) {
  if (files.hasOwnProperty('content')) {
    // this is a promise
    return files.content
  }

  const streams = []
  let totalSize = 0
  let isDir = false

  for (let file of files) {
    if (ignore.includes(file.name)) {
      continue
    }

    const stream = fileReader(file)

    if (file.webkitRelativePath) {
      isDir = true
    }

    streams.push({
      path: file.webkitRelativePath || file.name,
      content: stream,
      size: file.size
    })

    totalSize += file.size
  }

  return { streams, totalSize, isDir }
}

async function downloadSingle (file, gatewayUrl, apiUrl) {
  let url, filename

  if (file.type === 'directory') {
    url = `${apiUrl}/api/v0/get?arg=${file.hash}&archive=true&compress=true`
    filename = `${file.name}.tar.gz`
  } else {
    url = `${gatewayUrl}/ipfs/${file.hash}`
    filename = file.name
  }

  return { url, filename }
}

export async function makeHashFromFiles (files, ipfs) {
  let cid = await ipfs.object.new('unixfs-dir')

  for (const file of files) {
    cid = await ipfs.object.patch.addLink(cid.multihash, {
      name: file.name,
      size: file.size,
      cid: new CID(file.hash)
    })
  }

  return cid.toString()
}

async function downloadMultiple (files, apiUrl, ipfs) {
  if (!apiUrl) {
    const e = new Error('api url undefined')
    return Promise.reject(e)
  }

  const multihash = await makeHashFromFiles(files, ipfs)

  return {
    url: `${apiUrl}/api/v0/get?arg=${multihash}&archive=true&compress=true`,
    filename: `download_${multihash}.tar.gz`
  }
}

export async function getDownloadLink (files, gatewayUrl, apiUrl, ipfs) {
  if (files.length === 1) {
    return downloadSingle(files[0], gatewayUrl, apiUrl)
  }

  return downloadMultiple(files, apiUrl, ipfs)
}

export async function getShareableLink (files, ipfs) {
  let hash

  if (files.length === 1) {
    hash = files[0].hash
  } else {
    hash = await makeHashFromFiles(files, ipfs)
  }

  return `https://ipfs.io/ipfs/${hash}`
}
