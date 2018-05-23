import root from 'window-or-global'
import getIpfs from 'window.ipfs-fallback'

export default {
  name: 'ipfs',

  reducer (state = {}, action) {
    if (action.type === 'IPFS_INIT_FINISHED') {
      return { ...state, ipfsReady: true }
    }

    if (action.type === 'IPFS_GATEWAY_URL_FINISHED') {
      return { ...state, gatewayUrl: action.payload }
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

  doInitIpfs: () => async ({ dispatch }) => {
    dispatch({ type: 'IPFS_INIT_STARTED' })

    try {
      root.ipfs = await getIpfs({ api: true })
    } catch (err) {
      return dispatch({ type: 'IPFS_INIT_FAILED', payload: err })
    }

    dispatch({ type: 'IPFS_INIT_FINISHED' })
  },

  doGetGatewayUrl: () => async ({ dispatch }) => {
    dispatch({ type: 'IPFS_GATWAY_URL_STARTED' })

    getIpfs().config.get('Addresses.Gateway', (err, res) => {
      if (err) {
        dispatch({ type: 'IPFS_GATWAY_URL_ERRORED', payload: err })
        return
      }

      const split = res.split('/')
      const gateway = '//' + split[2] + ':' + split[4]

      dispatch({ type: 'IPFS_GATWAY_URL_FINISHED', payload: gateway })
    })
  }
}
