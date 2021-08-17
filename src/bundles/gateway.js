import { readSetting, writeSetting } from './local-storage'

const DEFAULT_GATEWAY = 'https://dweb.link'

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
