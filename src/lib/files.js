/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 */

/**
 * @param {File[]} files
 */
export async function filesToStreams (files) {
  const streams = []

  for (const file of files) {
    streams.push({
      path: file.filepath || file.webkitRelativePath || file.name,
      content: file,
      size: file.size
    })
  }

  return streams
}

async function downloadSingle (file, gatewayUrl, apiUrl) {
  let url, filename

  if (file.type === 'directory') {
    url = `${apiUrl}/api/v0/get?arg=${file.cid}&archive=true&compress=true`
    filename = `${file.name}.tar.gz`
  } else {
    url = `${gatewayUrl}/ipfs/${file.cid}`
    filename = file.name
  }

  return { url, filename }
}

export async function makeCIDFromFiles (files, ipfs) {
  let cid = await ipfs.object.new('unixfs-dir')

  for (const file of files) {
    cid = await ipfs.object.patch.addLink(cid, {
      name: file.name,
      size: file.size,
      cid: file.cid
    })
  }

  return cid
}

async function downloadMultiple (files, apiUrl, ipfs) {
  if (!apiUrl) {
    const e = new Error('api url undefined')
    return Promise.reject(e)
  }

  const cid = await makeCIDFromFiles(files, ipfs)

  return {
    url: `${apiUrl}/api/v0/get?arg=${cid}&archive=true&compress=true`,
    filename: `download_${cid}.tar.gz`
  }
}

export async function getDownloadLink (files, gatewayUrl, apiUrl, ipfs) {
  if (files.length === 1) {
    return downloadSingle(files[0], gatewayUrl, apiUrl)
  }

  return downloadMultiple(files, apiUrl, ipfs)
}

export async function getShareableLink (files, ipfs) {
  let cid
  let filename

  if (files.length === 1) {
    cid = files[0].cid
    if (files[0].type === 'file') {
      filename = `?filename=${encodeURIComponent(files[0].name)}`
    }
  } else {
    cid = await makeCIDFromFiles(files, ipfs)
  }

  return `https://ipfs.io/ipfs/${cid}${filename || ''}`
}
