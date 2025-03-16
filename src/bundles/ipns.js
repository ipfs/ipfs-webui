import all from 'it-all'
import { readSetting, writeSetting } from './local-storage.js'

const init = () => ({
  keys: [],
  expectedPublishTime: readSetting('expectedPublishTime') || 60
})

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
  },

  doImportIpnsKey: (file) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()
    const reader = new FileReader()
    reader.onload = async (event) => {
      const key = event.target.result
      await ipfs.key.import(file.name, key)
      store.doFetchIpnsKeys()
    }
    reader.readAsText(file)
  },

  doExportIpnsKey: (name) => async ({ getIpfs }) => {
    const ipfs = getIpfs()
    const key = await ipfs.key.export(name)
    const blob = new Blob([key], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.key`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  },

  doUpdateExpectedPublishTime: (time) => async ({ store, dispatch }) => {
    const oldExpectedTime = store.selectExpectedPublishTime()
    const avg = Math.floor((time * 1.5 + oldExpectedTime) / 2)
    await writeSetting('expectedPublishTime', avg)
    dispatch({ type: 'SET_EXPECTED_PUBLISH_TIME', payload: avg })
  }
}

export default ipnsBundle
