// @ts-check
import { pinningServiceTemplates } from '../constants/pinning'
import memoize from 'p-memoize'

const CID_PIN_CHECK_BATCH_SIZE = 10 // Pinata returns error when >10

const parseService = async (service, remoteServiceTemplates, ipfs) => {
  const template = remoteServiceTemplates.find(t => service.endpoint.toString() === t.apiEndpoint.toString())
  const icon = template?.icon
  const visitServiceUrl = template?.visitServiceUrl
  const parsedService = { ...service, name: service.service, icon, visitServiceUrl }

  if (service?.stat?.status === 'invalid') {
    return { ...parsedService, numberOfPins: -1, online: false }
  }

  const numberOfPins = service.stat?.pinCount?.pinned
  const online = typeof numberOfPins === 'number'
  const autoUpload = online ? await mfsPolicyEnableFlag(service.service, ipfs) : undefined

  return { ...parsedService, numberOfPins, online, autoUpload }
}

const mfsPolicyEnableFlag = memoize(async (serviceName, ipfs) => {
  try {
    return await ipfs.config.get(`Pinning.RemoteServices.${serviceName}.Policies.MFS.Enable`)
  } catch (e) {
    if (e.message?.includes('key has no attribute')) {
      try { // retry with notation from https://github.com/ipfs/go-ipfs/pull/8096
        return await ipfs.config.get(`Pinning.RemoteServices["${serviceName}"].Policies.MFS.Enable`)
      } catch (_) {}
    }
    console.error(`unexpected config.get error for "${serviceName}": ${e.message}`)
  }
  return false
}, { maxAge: 3000 })

const uniqueCidBatches = (arrayOfCids, size) => {
  const array = [...new Set(arrayOfCids)] // deduplicate CIDs
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
    pinningServices: [],
    remotePins: [],
    notRemotePins: [],
    arePinningServicesSupported: false
  }, action) => {
    if (action.type === 'CACHE_REMOTE_PINS') {
      const { adds, removals } = action.payload
      const remotePins = [...state.remotePins, ...adds].filter(p => !removals.some(r => r === p.id))
      const notRemotePins = [...state.notRemotePins, ...removals].filter(rid => !adds.some(a => a.id === rid))
      return { ...state, remotePins, notRemotePins }
    }
    if (action.type === 'SET_REMOTE_PINNING_SERVICES') {
      const oldServices = state.pinningServices
      const newServices = action.payload
      // Skip update when list length did not change and new one has no stats
      // so there is no janky update in 'Set pinning modal' when 3+ services
      // are defined and some of them are offline.
      if (oldServices.length === newServices.length) {
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

  doFetchRemotePins: (files, skipCache = false) => async ({ dispatch, store, getIpfs }) => {
    const pinningServices = store.selectPinningServices()
    if (!pinningServices?.length) return
    const ipfs = getIpfs()
    if (!ipfs || store?.ipfs?.ipfs?.ready || !ipfs.pin.remote) return

    const allCids = files ? files.map(f => f.cid) : []

    // Reuse known state for some CIDs to avoid unnecessary requests
    const cacheId2Cid = (id) => id.split(':').slice(-1)[0]
    const remotePins = store.selectRemotePins().map(pin => pin.id)
    const notRemotePins = store.selectNotRemotePins()

    // Check remaining CID status in chunks based on API limitation seen in real world
    const cids = uniqueCidBatches(allCids, CID_PIN_CHECK_BATCH_SIZE)

    const adds = []
    const removals = []

    await Promise.allSettled(pinningServices.map(async service => {
      try {
        // skip CIDs that we know the state of at this service
        const skipCids = skipCache ? new Set() : new Set(
          [...remotePins, ...notRemotePins]
            .filter(id => id.startsWith(service.name))
            .map(cacheId2Cid)
        )
        for (const cidChunk of cids) {
          const cidsToCheck = cidChunk.filter(cid => !skipCids.has(cid.toString()))
          if (!cidsToCheck.length) continue // skip if no new cids to check
          const notPins = new Set(cidsToCheck.map(cid => cid.toString()))
          try {
            // TODO: execute remote.ls with +1m backoff per service when response Type == "error" and Message includes "429 Too Many Requests"
            const pins = ipfs.pin.remote.ls({ service: service.name, cid: cidsToCheck })
            for await (const pin of pins) {
              const pinCid = pin.cid.toString()
              notPins.delete(pinCid)
              adds.push({ id: `${service.name}:${pinCid}`, ...pin })
            }
            // store 'not pinned remotely on this service' to avoid future checks
          } catch (e) {
            console.error(`Error: pin.remote.ls service=${service.name} cid=${cidsToCheck}: ${e.toString()}`)
          }
          // cache remaining ones as not pinned
          for (const notPinCid of notPins) {
            removals.push(`${service.name}:${notPinCid}`)
          }
        }
      } catch (e) {
        // ignore service and network errors for now
        // and continue checking remaining ones
        console.error('unexpected error during doFetchRemotePins', e)
      }
    }))
    dispatch({ type: 'CACHE_REMOTE_PINS', payload: { adds, removals } })
  },

  selectRemotePins: (state) => state.pinning.remotePins || [],
  selectNotRemotePins: (state) => state.pinning.notRemotePins || [],

  doSelectRemotePinsForFile: (file) => ({ store }) => {
    const pinningServicesNames = store.selectPinningServices().map(remote => remote.name)
    const remotePinForFile = store.selectRemotePins().filter(pin => pin.cid.string === file.cid.string)
    const servicesBeingUsed = remotePinForFile.map(pin => pin.id.split(':')[0]).filter(pinId => pinningServicesNames.includes(pinId))
    return servicesBeingUsed
  },

  // list of services without online check (reads list from config, should be instant)
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
  },

  // fetching pin stats for services is slower/expensive, so we only do that on Settings
  doFetchPinningServicesStats: () => async ({ getIpfs, store, dispatch }) => {
    const ipfs = getIpfs()
    if (!ipfs || store?.ipfs?.ipfs?.ready || !ipfs.pin.remote) return null
    const isPinRemotePresent = (await ipfs.commands()).Subcommands.find(c => c.Name === 'pin').Subcommands.some(c => c.Name === 'remote')
    if (!isPinRemotePresent) return null

    const remoteServiceTemplates = store.selectRemoteServiceTemplates()
    const servicesWithStats = await ipfs.pin.remote.service.ls({ stat: true })
    const remoteServices = await Promise.all(servicesWithStats.map(service => parseService(service, remoteServiceTemplates, ipfs)))

    dispatch({ type: 'SET_REMOTE_PINNING_SERVICES', payload: remoteServices })
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

  doSetPinning: (pin, services = [], wasLocallyPinned, previousRemotePins = []) => async ({ getIpfs, store, dispatch }) => {
    const ipfs = getIpfs()
    const { cid, name } = pin

    const pinLocally = services.includes('local')
    if (wasLocallyPinned !== pinLocally) {
      try {
        pinLocally ? await ipfs.pin.add(cid) : await ipfs.pin.rm(cid)
      } catch (e) {
        console.error(`unexpected local pin error for ${cid} (${name})`, e)
        const msgArgs = { serviceName: 'local', errorMsg: e.toString() }
        dispatch({ type: 'IPFS_PIN_FAILED', msgArgs })
      }
    }

    const adds = []
    const removals = []

    store.selectPinningServices().forEach(async service => {
      const shouldPin = services.includes(service.name)
      const wasPinned = previousRemotePins.includes(service.name)
      if (wasPinned === shouldPin) return

      const id = `${service.name}:${pin.cid}`
      try {
        if (shouldPin) {
          adds.push({ id, ...pin })
          // TODO: remove background:true and add pin job to queue.
          // wait for pinning to finish + add indicator for ongoing pinning
          await ipfs.pin.remote.add(cid, { service: service.name, name, background: true })
        } else {
          removals.push(id)
          await ipfs.pin.remote.rm({ cid: [cid], service: service.name })
        }
      } catch (e) {
        // log error and continue with other services
        console.error(`ipfs.pin.remote error for ${cid}@${service.name}`, e)
        const msgArgs = { serviceName: service.name, errorMsg: e.toString() }
        dispatch({ type: 'IPFS_PIN_FAILED', msgArgs })
      }
    })

    dispatch({ type: 'CACHE_REMOTE_PINS', payload: { adds, removals } })

    await store.doPinsFetch()
  },
  doAddPinningService: ({ apiEndpoint, nickname, secretApiKey }) => async ({ getIpfs }) => {
    const ipfs = getIpfs()

    // temporary mitigation for https://github.com/ipfs/ipfs-webui/issues/1770
    nickname = nickname.replaceAll('.', '_')

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
