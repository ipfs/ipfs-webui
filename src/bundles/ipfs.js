import root from 'window-or-global'
import getIpfs from 'window.ipfs-fallback'

export default {
  name: 'ipfs',

  reducer (state = {}, action) {
    if (action.type === 'IPFS_INIT_FINISHED') {
      return { ...state, ipfsReady: true }
    }
    return state
  },

  getExtraArgs () {
    return { getIpfs: () => root.ipfs }
  },

  selectIpfsReady: state => state.ipfs.ipfsReady,

  doInitIpfs: () => async ({ dispatch }) => {
    dispatch({ type: 'IPFS_INIT_STARTED' })

    try {
      root.ipfs = await getIpfs({ api: true })
    } catch (err) {
      return dispatch({ type: 'IPFS_INIT_FAILED', payload: err })
    }

    dispatch({ type: 'IPFS_INIT_FINISHED' })
  }
}
