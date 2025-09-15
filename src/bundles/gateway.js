import { readSetting, writeSetting } from './local-storage.js'

// TODO: switch to dweb.link when https://github.com/ipfs/kubo/issues/7318
export const DEFAULT_PATH_GATEWAY = 'https://ipfs.io'
export const DEFAULT_SUBDOMAIN_GATEWAY = 'https://dweb.link'
export const DEFAULT_IPFS_CHECK_URL = 'https://check.ipfs.network'
const IMG_HASH_1PX = 'bafkreib6wedzfupqy7qh44sie42ub4mvfwnfukmw6s2564flajwnt4cvc4' // 1x1.png
const IMG_ARRAY = [
  { id: 'IMG_HASH_1PX', name: '1x1.png', hash: IMG_HASH_1PX },
  { id: 'IMG_HASH_1PXID', name: '1x1.png', hash: 'bafkqax4jkbheodikdifaaaaabveuqrcsaaaaaaiaaaaacaidaaaaajo3k3faaaaaanieyvcfaaaabj32hxnaaaaaaf2fetstabaonwdgaaaaacsjiravicgxmnqaaaaaaiaadyrbxqzqaaaaabeuktsevzbgbaq' },
  { id: 'IMG_HASH_FAVICON', name: 'favicon.ico', hash: 'bafkreihc7efnl2prri6j6krcopelxms3xsh7undpsjqbfsasm7ikiyha4i' }
]

const readPublicGatewaySetting = () => {
  const setting = readSetting('ipfsPublicGateway')
  return setting || DEFAULT_PATH_GATEWAY
}

const readPublicSubdomainGatewaySetting = () => {
  const setting = readSetting('ipfsPublicSubdomainGateway')
  return setting || DEFAULT_SUBDOMAIN_GATEWAY
}

const readIpfsCheckUrlSetting = () => {
  const setting = readSetting('ipfsCheckUrl')
  return setting || DEFAULT_IPFS_CHECK_URL
}

const init = () => ({
  availableGateway: null,
  publicGateway: readPublicGatewaySetting(),
  publicSubdomainGateway: readPublicSubdomainGatewaySetting(),
  ipfsCheckUrl: readIpfsCheckUrlSetting()
})

export const checkValidHttpUrl = (value) => {
  let url

  try {
    url = new URL(value)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

/**
 * Check if any hashes from IMG_ARRAY can be loaded from the provided gatewayUrl
 * @see https://github.com/ipfs/ipfs-webui/issues/1937#issuecomment-1152894211 for more info
 */
export const checkViaImgSrc = (gatewayUrl) => {
  const url = new URL(gatewayUrl)

  /**
   * we check if gateway is up by loading 1x1 px image:
   * this is more robust check than loading js, as it won't be blocked
   * by privacy protections present in modern browsers or in extensions such as Privacy Badger
   */
  return Promise.any(IMG_ARRAY.map(element => {
    const imgUrl = new URL(`${url.protocol}//${url.hostname}/ipfs/${element.hash}?now=${Date.now()}&filename=${element.name}#x-ipfs-companion-no-redirect`)
    return checkImgSrcPromise(imgUrl)
  }))
}

const checkImgSrcPromise = (imgUrl) => {
  const imgCheckTimeout = 15000

  return new Promise((resolve, reject) => {
    const timeout = () => {
      if (!timer) return false
      clearTimeout(timer)
      timer = null
      return true
    }

    let timer = setTimeout(() => { if (timeout()) reject(new Error(`Image load timed out after ${imgCheckTimeout / 1000} seconds for URL: ${imgUrl}`)) }, imgCheckTimeout)
    const img = new Image()

    img.onerror = () => {
      timeout()
      reject(new Error(`Failed to load image from URL: ${imgUrl}`))
    }

    img.onload = () => {
      // subdomain works
      timeout()
      resolve()
    }

    img.src = imgUrl
  })
}

/**
 * Checks if a given URL redirects to a subdomain that starts with a specific hash.
 *
 * @param {URL} url - The URL to check for redirection.
 * @throws {Error} Throws an error if the URL does not redirect to the expected subdomain.
 * @returns {Promise<void>} A promise that resolves if the URL redirects correctly, otherwise it throws an error.
 */
async function expectSubdomainRedirect (url) {
  // Detecting redirects on remote Origins is extra tricky,
  // but we seem to be able to access xhr.responseURL which is enough to see
  // if paths are redirected to subdomains.

  const { url: responseUrl } = await fetch(url.toString())
  const { hostname } = new URL(responseUrl)

  if (!hostname.startsWith(IMG_HASH_1PX)) {
    const msg = `Expected ${url.toString()} to redirect to subdomain '${IMG_HASH_1PX}' but instead received '${responseUrl}'`
    console.error(msg)
    throw new Error(msg)
  }
}

/**
 * Checks if an image can be loaded from a given URL within a specified timeout.
 *
 * @param {URL} imgUrl - The URL of the image to be loaded.
 * @returns {Promise<void>} A promise that resolves if the image loads successfully within the timeout, otherwise it rejects with an error.
 */
async function checkViaImgUrl (imgUrl) {
  try {
    await checkImgSrcPromise(imgUrl)
  } catch (error) {
    throw new Error(`Error or timeout when attempting to load img from '${imgUrl.toString()}'`)
  }
}

/**
 * Checks if a given gateway URL is functioning correctly by verifying image loading and redirection.
 *
 * @param {string} gatewayUrl - The URL of the gateway to be checked.
 * @returns {Promise<boolean>} A promise that resolves to true if the gateway is functioning correctly, otherwise false.
 */
export async function checkSubdomainGateway (gatewayUrl) {
  if (gatewayUrl === DEFAULT_SUBDOMAIN_GATEWAY) {
    // avoid sending probe requests to the default gateway every time Settings page is opened
    return true
  }
  let imgSubdomainUrl
  let imgRedirectedPathUrl
  try {
    const gwUrl = new URL(gatewayUrl)
    imgSubdomainUrl = new URL(`${gwUrl.protocol}//${IMG_HASH_1PX}.ipfs.${gwUrl.hostname}/?now=${Date.now()}&filename=1x1.png#x-ipfs-companion-no-redirect`)
    imgRedirectedPathUrl = new URL(`${gwUrl.protocol}//${gwUrl.hostname}/ipfs/${IMG_HASH_1PX}?now=${Date.now()}&filename=1x1.png#x-ipfs-companion-no-redirect`)
  } catch (err) {
    console.error('Invalid URL:', err)
    return false
  }
  return await checkViaImgUrl(imgSubdomainUrl)
    .then(async () => expectSubdomainRedirect(imgRedirectedPathUrl))
    .then(() => {
      console.log(`Gateway at '${gatewayUrl}' is functioning correctly (verified image loading and redirection)`)
      return true
    })
    .catch((err) => {
      console.error(err)
      return false
    })
}

const bundle = {
  name: 'gateway',

  reducer: (state = init(), action) => {
    if (action.type === 'SET_AVAILABLE_GATEWAY') {
      return { ...state, availableGateway: action.payload }
    }

    if (action.type === 'SET_PUBLIC_GATEWAY') {
      return { ...state, publicGateway: action.payload }
    }

    if (action.type === 'SET_PUBLIC_SUBDOMAIN_GATEWAY') {
      return { ...state, publicSubdomainGateway: action.payload }
    }

    if (action.type === 'SET_IPFS_CHECK_URL') {
      return { ...state, ipfsCheckUrl: action.payload }
    }

    return state
  },

  doSetAvailableGateway: url => ({ dispatch }) => dispatch({ type: 'SET_AVAILABLE_GATEWAY', payload: url }),

  doUpdatePublicGateway: (address) => async ({ dispatch }) => {
    await writeSetting('ipfsPublicGateway', address)
    dispatch({ type: 'SET_PUBLIC_GATEWAY', payload: address })
  },

  doUpdatePublicSubdomainGateway: (address) => async ({ dispatch }) => {
    await writeSetting('ipfsPublicSubdomainGateway', address)
    dispatch({ type: 'SET_PUBLIC_SUBDOMAIN_GATEWAY', payload: address })
  },

  doUpdateIpfsCheckUrl: (url) => async ({ dispatch }) => {
    await writeSetting('ipfsCheckUrl', url)
    dispatch({ type: 'SET_IPFS_CHECK_URL', payload: url })
  },

  selectAvailableGateway: (state) => state?.gateway?.availableGateway,

  selectPublicGateway: (state) => state?.gateway?.publicGateway,

  selectPublicSubdomainGateway: (state) => state?.gateway?.publicSubdomainGateway,

  selectIpfsCheckUrl: (state) => state?.gateway?.ipfsCheckUrl
}

export default bundle
