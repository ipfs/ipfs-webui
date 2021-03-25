// @ts-check
import availablePinningServicesList from '../constants/pinning'

const parseService = async (service, availablePinningServices, ipfs) => {
  const icon = availablePinningServices.find(x => x.name.toLowerCase() === service.service.toLowerCase())?.icon
  const autoUpload = await ipfs.config.get(`Pinning.RemoteServices.${service.service}.Policies.MFS.Enable`)
  const parsedService = { ...service, name: service.service, icon, autoUpload }

  if (service?.stat?.status === 'invalid') {
    console.error(`Invalid stats found for service ${service.service}`)

    return { ...parsedService, numberOfPins: 'Error' }
  }

  return { ...parsedService, numberOfPins: service.stat?.pinCount?.pinned }
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
    arePinningServicesSupported: false
  }, action) => {
    if (action.type === 'SET_REMOTE_PINS') {
      return { ...state, remotePins: action.payload }
    }
    if (action.type === 'ADD_REMOTE_PIN') {
      return { ...state, remotePins: [...state.remotePins, action.payload] }
    }
    if (action.type === 'REMOVE_REMOTE_PIN') {
      return { ...state, remotePins: state.remotePins.filter(p => p.id !== action.payload.id) }
    }
    if (action.type === 'SET_REMOTE_PINNING_SERVICES') {
      return { ...state, pinningServices: action.payload }
    }
    if (action.type === 'SET_REMOTE_PINNING_SERVICES_AVAILABLE') {
      return { ...state, arePinningServicesSupported: action.payload }
    }
    return state
  },

  doFetchRemotePins: () => async ({ dispatch, store, getIpfs }) => {
    const pinningServices = store.selectPinningServices()

    if (!pinningServices?.length) return

    const ipfs = getIpfs()

    if (!ipfs || store?.ipfs?.ipfs?.ready || !ipfs.pin.remote) return

    dispatch({ type: 'SET_REMOTE_PINS', payload: [] })

    await Promise.all(pinningServices.map(async service => {
      try {
        const pins = ipfs.pin.remote.ls({ service: service.name })
        for await (const pin of pins) {
          dispatch({
            type: 'ADD_REMOTE_PIN',
            payload: {
              ...pin,
              id: `${service.name}:${pin.cid}`
            }
          })
        }
      } catch (_) {
        // if one of services is offline, ignore it for now
        // and continue checking remaining ones
      }
    }))
  },

  selectRemotePins: (state) => state.pinning.remotePins || [],

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

    const availablePinningServices = store.selectAvailablePinningServices()
    const offlineListOfServices = await ipfs.pin.remote.service.ls()
    const remoteServices = await Promise.all(offlineListOfServices.map(service => parseService(service, availablePinningServices, ipfs)))
    dispatch({ type: 'SET_REMOTE_PINNING_SERVICES', payload: remoteServices })

    const fullListOfServices = await ipfs.pin.remote.service.ls({ stat: true })
    const fullRemoteServices = await Promise.all(fullListOfServices.map(service => parseService(service, availablePinningServices, ipfs)))
    dispatch({ type: 'SET_REMOTE_PINNING_SERVICES', payload: fullRemoteServices })
  },

  selectPinningServices: (state) => state.pinning.pinningServices || [],

  selectAvailablePinningServices: () => availablePinningServicesList,

  selectArePinningServicesSupported: (state) => state.pinning.arePinningServicesSupported,

  selectPinningServicesDefaults: () => availablePinningServicesList.reduce((prev, curr) => ({
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
