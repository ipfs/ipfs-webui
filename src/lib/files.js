import fileReader from 'pull-file-reader'

export async function filesToStreams (files) {
  if (files.hasOwnProperty('content')) {
    // this is a promise
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

async function downloadMultiple (files, apiUrl, ipfs) {
  if (!apiUrl) {
    const e = new Error('api url undefined')
    return Promise.reject(e)
  }

  let node = await ipfs.object.new('unixfs-dir')

  for (const file of files) {
    try {
      node = await ipfs.object.patch.addLink(node.toJSON().multihash, {
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

export async function getDownloadLink (files, gatewayUrl, apiUrl) {
  if (files.length === 1) {
    return downloadSingle(files[0], gatewayUrl, apiUrl)
  }

  return downloadMultiple(files)
}
