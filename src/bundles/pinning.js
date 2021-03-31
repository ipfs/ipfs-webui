// @ts-check
import { pinningServiceTemplates } from '../constants/pinning'

const parseService = async (service, remoteServiceTemplates, ipfs) => {
  const template = remoteServiceTemplates.find(x => service.service.toLowerCase().includes(x.name.toLowerCase()))
  const icon = template?.icon
  const visitServiceUrl = template?.visitServiceUrl
  const autoUpload = await ipfs.config.get(`Pinning.RemoteServices.${service.service}.Policies.MFS.Enable`)
  const parsedService = { ...service, name: service.service, icon, visitServiceUrl, autoUpload }

  if (service?.stat?.status === 'invalid') {
    return { ...parsedService, numberOfPins: 'Error', online: false }
  }

  return { ...parsedService, numberOfPins: service.stat?.pinCount?.pinned, online: true }
}

const chunkArray = (array, size) => {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size)
    result.push(chunk)
  }
  return result
}

/**
 * TODO: This might change, current version from: https://github.com/ipfs/go-ipfs/blob/petar/pincli/core/commands/remotepin.go#L53
 * @typedef {Object} RemotePin
 * @property {string} id
 * @property {string} name
 * @property {('queued'|'pinning'|'pinned'|'failed')} status
 * @property {string} cid
 * @property {Array<string>} [delegates] (multiaddrs endind with /p2p/peerid)
*/
const pinningBundle = {
  name: 'pinning',
  reducer: (state = {
    remotePins: [],
    notRemotePins: [],
    arePinningServicesSupported: false
  }, action) => {
    if (action.type === 'ADD_REMOTE_PIN') {
      return {
        ...state,
        remotePins: [...state.remotePins, action.payload],
        notRemotePins: state.notRemotePins.filter(id => id !== action.payload.id)
      }
    }
    if (action.type === 'REMOVE_REMOTE_PIN') {
      return {
        ...state,
        remotePins: state.remotePins.filter(p => p.id !== action.payload.id),
        notRemotePins: [...state.notRemotePins, action.payload.id]
      }
    }
    if (action.type === 'SET_REMOTE_PINNING_SERVICES') {
      const oldServices = state.pinningServices
      const newServices = action.payload
      // Skip update when list length did not change and new one has no stats
      // so there is no janky update in 'Set pinning modal' when 3+ services
      // are defined and some of them are offline.
      if (oldServices && oldServices.length === newServices.length) {
        const withPinStats = s => (s && typeof s.numberOfPins !== 'undefined')
        const oldStats = oldServices.some(withPinStats)
        const newStats = newServices.some(withPinStats)
        if (oldStats && !newStats) return state
      }
      return { ...state, pinningServices: newServices }
    }
    if (action.type === 'SET_REMOTE_PINNING_SERVICES_AVAILABLE') {
      return { ...state, arePinningServicesSupported: action.payload }
    }
    return state
  },

  doFetchRemotePins: (files) => async ({ dispatch, store, getIpfs }) => {
    const pinningServices = store.selectPinningServices()

    if (!pinningServices?.length) return

    const ipfs = getIpfs()

    if (!ipfs || store?.ipfs?.ipfs?.ready || !ipfs.pin.remote) return

    const allCids = files ? files.map(f => f.cid) : []

    // Reuse known state for some CIDs to avoid unnecessary requests
    const cacheId2Cid = (id) => id.split(':').slice(-1)[0]
    const remotePins = store.selectRemotePins().map(pin => pin.id)
    const notRemotePins = store.selectNotRemotePins()

    // Check remaining CID status in chunks of 10 (remote API limitation)
    const cids = chunkArray(allCids, 10)

    await Promise.allSettled(pinningServices.map(async service => {
      try {
        // skip CIDs that we know the state of at this service
        const skipCids = new Set(
          [...remotePins, ...notRemotePins]
            .filter(id => id.startsWith(service.name))
            .map(cacheId2Cid)
        )
        return Promise.allSettled(cids.map(async cidChunk => {
          const cidsToCheck = cidChunk.filter(cid => !skipCids.has(cid.toString()))
          if (!cidsToCheck.length) return // skip if no new cids to check
          const notPins = new Set(cidsToCheck.map(cid => cid.toString()))
          const pins = ipfs.pin.remote.ls({ service: service.name, cid: cidsToCheck })
          for await (const pin of pins) {
            notPins.delete(pin.cid.toString())
            dispatch({
              type: 'ADD_REMOTE_PIN',
              payload: {
                ...pin,
                id: `${service.name}:${pin.cid}`
              }
            })
          }
          // store 'not pinned remotely on this service' to avoid future checks
          for (const notPin of notPins.values()) {
            dispatch({
              type: 'REMOVE_REMOTE_PIN',
              payload: { id: `${service.name}:${notPin}` }
            })
          }
        }))
      } catch (_) {
        // if one of services is offline, ignore it for now
        // and continue checking remaining ones
      }
    }))
  },

  selectRemotePins: (state) => state.pinning.remotePins || [],
  selectNotRemotePins: (state) => state.pinning.notRemotePins || [],

  doSelectRemotePinsForFile: (file) => ({ store }) => {
    const pinningServicesNames = store.selectPinningServices().map(remote => remote.name)

    const remotePinForFile = store.selectRemotePins().filter(pin => pin.cid.string === file.cid.string)
    const servicesBeingUsed = remotePinForFile.map(pin => pin.id.split(':')[0]).filter(pinId => pinningServicesNames.includes(pinId))

    return servicesBeingUsed
  },

  doFetchPinningServices: () => async ({ getIpfs, store, dispatch }) => {
    const ipfs = getIpfs()
    if (!ipfs || store?.ipfs?.ipfs?.ready || !ipfs.pin.remote) return null

    const isPinRemotePresent = (await ipfs.commands()).Subcommands.find(c => c.Name === 'pin').Subcommands.some(c => c.Name === 'remote')
    dispatch({ type: 'SET_REMOTE_PINNING_SERVICES_AVAILABLE', payload: isPinRemotePresent })
    if (!isPinRemotePresent) return null

    const remoteServiceTemplates = store.selectRemoteServiceTemplates()
    const offlineListOfServices = await ipfs.pin.remote.service.ls()
    const remoteServices = await Promise.all(offlineListOfServices.map(service => parseService(service, remoteServiceTemplates, ipfs)))
    dispatch({ type: 'SET_REMOTE_PINNING_SERVICES', payload: remoteServices })

    const fullListOfServices = await ipfs.pin.remote.service.ls({ stat: true })
    const fullRemoteServices = await Promise.all(fullListOfServices.map(service => parseService(service, remoteServiceTemplates, ipfs)))
    dispatch({ type: 'SET_REMOTE_PINNING_SERVICES', payload: fullRemoteServices })
  },

  selectPinningServices: (state) => state.pinning.pinningServices || [],

  selectRemoteServiceTemplates: () => pinningServiceTemplates,

  selectArePinningServicesSupported: (state) => state.pinning.arePinningServicesSupported,

  selectPinningServicesDefaults: () => pinningServiceTemplates.reduce((prev, curr) => ({
    ...prev,
    [curr.name]: {
      ...curr,
      nickname: curr.name
    }
  }), {}),

  doSetPinning: (pin, services = []) => async ({ getIpfs, store, dispatch }) => {
    const ipfs = getIpfs()
    const { cid, name } = pin

    const pinLocally = services.includes('local')
    try {
      pinLocally ? await ipfs.pin.add(cid) : await ipfs.pin.rm(cid)
    } catch (e) {
      console.error(e)
    }

    store.selectPinningServices().forEach(async service => {
      const shouldPin = services.includes(service.name)
      try {
        if (shouldPin) {
          dispatch({
            type: 'ADD_REMOTE_PIN',
            payload: {
              ...pin,
              id: `${service.name}:${pin.cid}`
            }
          })
          await ipfs.pin.remote.add(cid, { service: service.name, name })
        } else {
          dispatch({
            type: 'REMOVE_REMOTE_PIN',
            payload: { id: `${service.name}:${pin.cid}` }
          })
          await ipfs.pin.remote.rm({ cid: [cid], service: service.name })
        }
      } catch (e) {
        console.error(e)
      }
    })

    await store.doPinsFetch()
  },
  doAddPinningService: ({ apiEndpoint, nickname, secretApiKey }) => async ({ getIpfs }) => {
    const ipfs = getIpfs()

    await ipfs.pin.remote.service.add(nickname, {
      endpoint: apiEndpoint,
      key: secretApiKey
    })
  },

  doRemovePinningService: (name) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()

    await ipfs.pin.remote.service.rm(name)

    store.doFetchPinningServices()
  },

  doSetAutoUploadForService: (name) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()

    const configName = `Pinning.RemoteServices.${name}.Policies.MFS.Enable`

    const previousPolicy = await ipfs.config.get(configName)

    await ipfs.config.set(configName, !previousPolicy)

    store.doFetchPinningServices()
  }
}
export default pinningBundle
