/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {import('../bundles/files/actions').FileStat} FileStat
 * @typedef {import('cids')} CID
 */

/**
 * @typedef {Object} FileExt
 * @property {string} [filepath]
 * @property {string} [webkitRelativePath]
 *
 * @typedef {FileExt &  File} ExtendedFile
 *
 * @typedef {Object} FileStream
 * @property {string} path
 * @property {Blob} content
 * @property {number} size
 * @property {boolean} [appendCID]
 *
 * @param {ExtendedFile[]} files
 * @returns {FileStream[]}
 */
export function normalizeFiles (files) {
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

/**
 * @typedef {Object} FileDownload
 * @property {string} url
 * @property {string} filename
 * @property {string} method
 *
 * @param {FileStat} file
 * @param {string} gatewayUrl
 * @param {string} apiUrl
 * @returns {Promise<FileDownload>}
 */
async function downloadSingle (file, gatewayUrl, apiUrl) {
  let url, filename, method

  if (file.type === 'directory') {
    url = `${apiUrl}/api/v0/get?arg=${file.cid}&archive=true&compress=true`
    filename = `${file.name}.tar.gz`
    method = 'POST' // API is POST-only
  } else {
    url = `${gatewayUrl}/ipfs/${file.cid}`
    filename = file.name
    method = 'GET'
  }

  return { url, filename, method }
}

/**
 * @param {FileStat[]} files
 * @param {IPFSService} ipfs
 * @returns {Promise<CID>}
 */
export async function makeCIDFromFiles (files, ipfs) {
  let cid = await ipfs.object.new({ template: 'unixfs-dir' })

  for (const file of files) {
    cid = await ipfs.object.patch.addLink(cid, {
      name: file.name,
      // @ts-ignore - can this be `null` ?
      size: file.size,
      cid: file.cid
    })
  }

  return cid
}

/**
 *
 * @param {FileStat[]} files
 * @param {string} apiUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<FileDownload>}
 */
async function downloadMultiple (files, apiUrl, ipfs) {
  if (!apiUrl) {
    const e = new Error('api url undefined')
    return Promise.reject(e)
  }

  const cid = await makeCIDFromFiles(files, ipfs)

  return {
    url: `${apiUrl}/api/v0/get?arg=${cid}&archive=true&compress=true`,
    filename: `download_${cid}.tar.gz`,
    method: 'POST' // API is POST-only
  }
}

/**
 *
 * @param {FileStat[]} files
 * @param {string} gatewayUrl
 * @param {string} apiUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<FileDownload>}
 */
export async function getDownloadLink (files, gatewayUrl, apiUrl, ipfs) {
  if (files.length === 1) {
    return downloadSingle(files[0], gatewayUrl, apiUrl)
  }

  return downloadMultiple(files, apiUrl, ipfs)
}

/**
 * @param {FileStat[]} files
 * @param {IPFSService} ipfs
 * @returns {Promise<string>}
 */
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
