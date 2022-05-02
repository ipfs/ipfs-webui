import { readSetting, writeSetting } from './local-storage'

export const DEFAULT_GATEWAY = 'https://ipfs.io' // TODO: switch to dweb.link when https://github.com/ipfs/go-ipfs/issues/7318
const IMG_HASH = 'bafybeibwzifw52ttrkqlikfzext5akxu7lz4xiwjgwzmqcpdzmp3n5vnbe' // 1x1px image

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

export const checkViaImgSrc = (gatewayUrl) => {
  const url = new URL(gatewayUrl)
  const imgUrl = new URL(`${url.protocol}//${url.hostname}/ipfs/${IMG_HASH}?now=${Date.now()}&filename=1x1.png#x-ipfs-companion-no-redirect`)

  // we check if gateway is up by loading 1x1 px image:
  // this is more robust check than loading js, as it won't be blocked
  // by privacy protections present in modern browsers or in extensions such as Privacy Badger
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
