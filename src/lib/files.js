import fileReader from 'pull-file-reader'
import CID from 'cids'

export async function filesToStreams (files) {
  console.log(files)
  const streams = []

  for (let file of files) {
    const stream = fileReader(file)

    console.log(file)

    streams.push({
      path: file.filepath || file.webkitRelativePath || file.name,
      content: stream,
      size: file.size
    })
  }

  return streams
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
