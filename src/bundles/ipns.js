import all from 'it-all'

const ipnsBundle = {
  name: 'ipns',
  reducer: (state = {
    keys: []
  }, action) => {
    if (action.type === 'CACHE_IPNS_KEYS') {
      return { ...state, keys: action.payload }
    }

    return state
  },

  selectIpnsKeys: (state) => state.ipns.keys || [],

  doFetchIpnsKeys: () => async ({ getIpfs, dispatch }) => {
    const ipfs = getIpfs()
    const rawKeys = await ipfs.key.list()
    const keys = []

    for (const { id, name } of rawKeys) {
      const names = await all(ipfs.name.resolve(`/ipns/${id}`, { offline: true }))
      const published = names.length > 0
      keys.push({ id, name, published })
    }

    dispatch({ type: 'CACHE_IPNS_KEYS', payload: keys })
  },

  doGenerateIpnsKey: (name) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()

    // Stronger defaults than the listed on the docs:
    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/KEY.md#ipfskeygenname-options
    await ipfs.key.gen(name, {
      type: 'ed25519',
      size: 4096
    })

    store.doFetchIpnsKeys()
  },

  doRemoveIpnsKey: (name) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()
    await ipfs.key.rm(name)

    store.doFetchIpnsKeys()
  },

  doRenameIpnsKey: (oldName, newName) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()
    await ipfs.key.rename(oldName, newName)

    store.doFetchIpnsKeys()
  },

  doPublishIpnsKey: (cid, key) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()
    await ipfs.name.publish(cid, { key })
  }
}
export default ipnsBundle
