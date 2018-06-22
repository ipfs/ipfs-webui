import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'config',
  actionBaseType: 'CONFIG',
  getPromise: async ({getIpfs}) => {
    // Uint8Array
    const rawConf = await getIpfs().config.get()
    // stringy json for quick compares
    const conf = rawConf.toString()
    return conf
  },
  staleAfter: 60000,
  checkIfOnline: false
})

// derive the object from the stringy json
bundle.selectConfigObject = createSelector(
  `selectConfig`,
  (configStr) => JSON.parse(configStr)
)

bundle.doSaveConfig = (configStr) => async ({dispatch, getIpfs, store}) => {
  dispatch({type: 'CONFIG_SAVE_STARTED'})
  try {
    const obj = JSON.parse(configStr)
    await getIpfs().config.replace(obj)
  } catch (err) {
    return dispatch({ type: 'CONFIG_SAVE_ERRORED', payload: {error: err, config: configStr} })
  }
  store.doMarkConfigAsOutdated()
  dispatch({type: 'CONFIG_SAVE_FINISHED'})
}

// Fetch the config if we don't have it or it's more than `staleAfter` ms old
bundle.reactConfigFetch = createSelector(
  'selectConfigShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchConfig' }
    }
  }
)

export default bundle
