import { readSetting, writeSetting } from './local-storage.js'

export const DEFAULT_GATEWAY = 'https://ipfs.io' // TODO: switch to dweb.link when https://github.com/ipfs/kubo/issues/7318
const IMG_ARRAY = [
  { id: 'IMG_HASH_1PX', name: '1x1.png', hash: 'bafybeibwzifw52ttrkqlikfzext5akxu7lz4xiwjgwzmqcpdzmp3n5vnbe' },
  { id: 'IMG_HASH_1PXID', name: '1x1.png', hash: 'bafkqax4jkbheodikdifaaaaabveuqrcsaaaaaaiaaaaacaidaaaaajo3k3faaaaaanieyvcfaaaabj32hxnaaaaaaf2fetstabaonwdgaaaaacsjiravicgxmnqaaaaaaiaadyrbxqzqaaaaabeuktsevzbgbaq' },
  { id: 'IMG_HASH_FAVICON', name: 'favicon.ico', hash: 'bafkreihc7efnl2prri6j6krcopelxms3xsh7undpsjqbfsasm7ikiyha4i' }
]

const readPublicGatewaySetting = () => {
  const setting = readSetting('ipfsPublicGateway')
  return setting || DEFAULT_GATEWAY
}

const init = () => ({
  availableGateway: null,
  publicGateway: readPublicGatewaySetting()
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

    let timer = setTimeout(() => { if (timeout()) reject(new Error()) }, imgCheckTimeout)
    const img = new Image()

    img.onerror = () => {
      timeout()
      reject(new Error())
    }

    img.onload = () => {
      // subdomain works
      timeout()
      resolve()
    }

    img.src = imgUrl
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

    return state
  },

  doSetAvailableGateway: url => ({ dispatch }) => dispatch({ type: 'SET_AVAILABLE_GATEWAY', payload: url }),

  doUpdatePublicGateway: (address) => async ({ dispatch }) => {
    await writeSetting('ipfsPublicGateway', address)
    dispatch({ type: 'SET_PUBLIC_GATEWAY', payload: address })
  },

  selectAvailableGateway: (state) => state?.gateway?.availableGateway,

  selectPublicGateway: (state) => state?.gateway?.publicGateway
}

export default bundle
