import all from 'it-all'
import { dispatchAsyncProvide } from './files/utils.js'
import { createContextSelector } from '../helpers/context-bridge.jsx'

const selectLocalStorageFromContext = createContextSelector('localStorage')

const getLocalStorageUtils = () => {
  const localStorageContext = selectLocalStorageFromContext()
  return {
    readSetting: localStorageContext?.readSetting || (() => null),
    writeSetting: localStorageContext?.writeSetting || (() => {})
  }
}

const init = () => {
  const { readSetting } = getLocalStorageUtils()
  return {
    keys: [],
    expectedPublishTime: readSetting('expectedPublishTime') || 60
  }
}

const ipnsBundle = {
  name: 'ipns',
  reducer: (state = init(), action) => {
    if (action.type === 'CACHE_IPNS_KEYS') {
      return { ...state, keys: action.payload }
    }

    if (action.type === 'SET_EXPECTED_PUBLISH_TIME') {
      return { ...state, expectedPublishTime: action.payload }
    }

    return state
  },

  selectIpnsKeys: (state) => state.ipns.keys || [],

  selectExpectedPublishTime: (state) => state.ipns.expectedPublishTime,

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
    await ipfs.key.gen(name)
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

    // Trigger background provide operation for the published CID
    dispatchAsyncProvide(cid, ipfs, 'IPNS')
  },

  doUpdateExpectedPublishTime: (time) => async ({ store, dispatch }) => {
  const { writeSetting } = getLocalStorageUtils()
  // moderate expectation: publishing should take no longer than average
  // between old expectation and the length of the last publish + some buffer
  const oldExpectedTime = store.selectExpectedPublishTime()
  const avg = Math.floor((time * 1.5 + oldExpectedTime) / 2)
  await writeSetting('expectedPublishTime', avg)
  dispatch({ type: 'SET_EXPECTED_PUBLISH_TIME', payload: avg })
}
}

export default ipnsBundle
