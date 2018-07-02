import root from 'window-or-global'
import getIpfs from 'window.ipfs-fallback'

function getURL (dispatch, getIpfs, action, addr) {
  dispatch({ type: `IPFS_${action}_STARTED` })

  getIpfs().config.get(`Addresses.${addr}`, (err, res) => {
    if (err) {
      console.log(err)
      dispatch({ type: `IPFS_${action}_ERRORED`, payload: err })
      return
    }

    const split = res.split('/')
    const url = '//' + split[2] + ':' + split[4]

    dispatch({ type: `IPFS_${action}_FINISHED`, payload: url })
  })
}

export default {
  name: 'ipfs',

  reducer (state = {}, action) {
    if (action.type === 'IPFS_INIT_FINISHED') {
      return { ...state, ipfsReady: true }
    }

    if (action.type === 'IPFS_GATEWAY_URL_FINISHED') {
      return { ...state, gatewayUrl: action.payload }
    }

    if (action.type === 'IPFS_API_URL_FINISHED') {
      return { ...state, apiUrl: action.payload }
    }

    if (!state.gatewayUrl) {
      return { ...state, gatewayUrl: 'https://ipfs.io' }
    }

    return state
  },

  getExtraArgs () {
    return { getIpfs: () => root.ipfs }
  },

  selectIpfsReady: state => state.ipfs.ipfsReady,

  selectGatewayUrl: state => state.ipfs.gatewayUrl,

  selectApiUrl: state => state.ipfs.apiUrl,

  doInitIpfs: () => async ({ dispatch, store }) => {
    dispatch({ type: 'IPFS_INIT_STARTED' })

    try {
      root.ipfs = await getIpfs({ api: true })
    } catch (err) {
      return dispatch({ type: 'IPFS_INIT_FAILED', payload: err })
    }

    store.doGetGatewayUrl()
    store.doGetApiUrl()
    dispatch({ type: 'IPFS_INIT_FINISHED' })
  },

  doGetGatewayUrl: () => async ({ dispatch, getIpfs }) => {
    getURL(dispatch, getIpfs, 'GATEWAY_URL', 'Gateway')
  },

  doGetApiUrl: () => async ({ dispatch, getIpfs }) => {
    getURL(dispatch, getIpfs, 'API_URL', 'API')
  }
}
