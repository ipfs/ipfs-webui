import filesize from 'filesize';
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
 *
 * @param {ExtendedFile[]} files
 * @returns {FileStream[]}
 */
export function normalizeFiles(files) {
    const streams = [];
    for (const file of files) {
        streams.push({
            path: file.filepath || file.webkitRelativePath || file.name,
            content: file,
            size: file.size
        });
    }
    return streams;
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
async function downloadSingle(file, gatewayUrl, apiUrl) {
    let url, filename, method;
    if (file.type === 'directory') {
        const name = file.name || `download_${file.cid}`; // Name is not always available.
        url = `${apiUrl}/api/v0/get?arg=${file.cid}&archive=true&compress=true`;
        filename = `${name}.tar.gz`;
        method = 'POST'; // API is POST-only
    }
    else {
        url = `${gatewayUrl}/ipfs/${file.cid}?download=true&filename=${file.name}`;
        filename = file.name;
        method = 'GET';
    }
    return { url, filename, method };
}
/**
 * @param {FileStat[]} files
 * @param {IPFSService} ipfs
 * @returns {Promise<CID>}
 */
export async function makeCIDFromFiles(files, ipfs) {
    // Note: we don't use 'object patch' here, it was deprecated.
    // We are using MFS for creating CID of an ephemeral directory
    // because it handles HAMT-sharding of big directories automatically
    // See: https://github.com/ipfs/kubo/issues/8106
    const dirpath = `/zzzz_${Date.now()}`;
    await ipfs.files.mkdir(dirpath, {});
    for (const { cid, name } of files) {
        await ipfs.files.cp(`/ipfs/${cid}`, `${dirpath}/${name}`);
    }
    const stat = await ipfs.files.stat(dirpath);
    // Do not wait for this
    ipfs.files.rm(dirpath, { recursive: true });
    return stat.cid;
}
/**
 *
 * @param {FileStat[]} files
 * @param {string} apiUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<FileDownload>}
 */
async function downloadMultiple(files, apiUrl, ipfs) {
    if (!apiUrl) {
        const e = new Error('api url undefined');
        return Promise.reject(e);
    }
    const cid = await makeCIDFromFiles(files, ipfs);
    return {
        url: `${apiUrl}/api/v0/get?arg=${cid}&archive=true&compress=true`,
        filename: `download_${cid}.tar.gz`,
        method: 'POST' // API is POST-only
    };
}
/**
 *
 * @param {FileStat[]} files
 * @param {string} gatewayUrl
 * @param {string} apiUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<FileDownload>}
 */
export async function getDownloadLink(files, gatewayUrl, apiUrl, ipfs) {
    if (files.length === 1) {
        return downloadSingle(files[0], gatewayUrl, apiUrl);
    }
    return downloadMultiple(files, apiUrl, ipfs);
}
/**
 * @param {FileStat[]} files
 * @param {string} gatewayUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<string>}
 */
export async function getShareableLink(files, gatewayUrl, ipfs) {
    let cid;
    let filename;
    if (files.length === 1) {
        cid = files[0].cid;
        if (files[0].type === 'file') {
            filename = `?filename=${encodeURIComponent(files[0].name)}`;
        }
    }
    else {
        cid = await makeCIDFromFiles(files, ipfs);
    }
    return `${gatewayUrl}/ipfs/${cid}${filename || ''}`;
}
/**
 *
 * @param {FileStat[]} files
 * @param {string} gatewayUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<string>}
 */
export async function getCarLink(files, gatewayUrl, ipfs) {
    let cid, filename;
    if (files.length === 1) {
        cid = files[0].cid;
        filename = encodeURIComponent(files[0].name);
    }
    else {
        cid = await makeCIDFromFiles(files, ipfs);
    }
    return `${gatewayUrl}/ipfs/${cid}?format=car&filename=${filename || cid}.car`;
}
/**
 * @param {number} size in bytes
 * @param {object} opts format customization
 * @returns {string} human-readable size
 */
export function humanSize(size, opts) {
    if (typeof size === 'undefined' || size === null)
        return 'N/A';
    return filesize(size || 0, {
        // base-2 byte units (GiB, MiB, KiB) to remove any ambiguity
        spacer: String.fromCharCode(160),
        round: size >= 1073741824 ? 1 : 0,
        standard: 'iec',
        base: 2,
        bits: false,
        ...opts
    });
}
