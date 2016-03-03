import API from 'ipfs-api'
import {CANCEL} from 'redux-saga'
import {keyBy, compact, sortBy} from 'lodash-es'
import {lookup} from 'ipfs-geoip'
import {join} from 'path'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const localApi = new API(host, port)

let logSource

function lookupIP (api, ip) {
  return new Promise((resolve, reject) => {
    lookup(api, ip, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function splitId (id) {
  const index = id.lastIndexOf('/')
  return {
    address: id.substring(0, index).replace(/\/ipfs$/, ''),
    id: id.substring(index + 1)
  }
}

function cancellablePromise (p, doCancel) {
  p[CANCEL] = doCancel
  return p
}

function streamToIterator (ref) {
  const messageQueue = []
  const resolveQueue = []

  const handleMsg = (msg) => {
    // anyone waiting for a message ?
    if (resolveQueue.length) {
      const nextResolve = resolveQueue.shift()
      nextResolve(msg)
    } else {
      // no one is waiting ? queue the event
      messageQueue.push(msg)
    }
  }

  const listenerID = ref.on('data', (msg) => {
    handleMsg(msg)
  })

  ref.on('error', (err) => {
    handleMsg(err)
  })

  ref.on('end', () => {
    handleMsg(new Error('Stream ended'))
  })

  function close () {
    ref.removeListener('data', listenerID)
  }

  return {
    getNext () {
      // do we have queued messages ?
      if (messageQueue.length) {
        const val = messageQueue.shift()
        let promise
        if (val instanceof Error) {
          promise = Promise.reject(val)
        } else {
          promise = Promise.resolve(val)
        }
        return cancellablePromise(promise, close)
      }

      return cancellablePromise(
        new Promise((resolve) => resolveQueue.push(resolve)),
        close
      )
    }
  }
}

function logSourceMaker (api) {
  return api.log.tail().then((stream) => {
    stream.on('end', () => {
      logSource = null
    })
    return streamToIterator(stream)
  })
}

// -- Public Interface

export const id = localApi.id

export const createLogSource = (api = localApi) => {
  if (!logSource) logSource = logSourceMaker(api)

  return logSource
}

export const peerIds = (api = localApi) => {
  return api.swarm.peers().then(({Strings}) => {
    return Strings.map(splitId)
  })
}

export const peerDetails = (ids, api = localApi) => {
  return Promise.all(
    ids.map(({id, address}) => {
      return api.id(id).then((details) => ({
        ...details,
        id,
        address
      }))
    }))
    .then((details) => {
      return keyBy(details, 'id')
    })
}

export const peerLocations = (ids, api = localApi) => {
  return Promise.all(
    ids
      .filter(({address}) => {
        // Only ip4 and ip6 addresses
        return address.match(/ip[4,6]/)
      })
      .map(({id, address}) => {
        const [, ip] = address.match(/ip[4,6]\/([^\/]*)\//)
        // TODO: Replace with ipfs based location database
        return lookupIP(api, ip)
          .then((location) => {
            return {
              ...location,
              id
            }
          })
          .catch(() => {
            return
          })
      })
  ).then((locations) => {
    return keyBy(compact(locations), 'id')
  })
}

export const files = {
  list (root, api = localApi) {
    return api.files.ls(root)
      .then((res) => {
        const files = sortBy(res.Entries, 'Name') || []

        return Promise.all(files.map((file) => {
          return api.files.stat(join(root, file.Name))
            .then((stats) => {
              return {...file, ...stats}
            })
        }))
      })
  },
  mkdir (name, api = localApi) {
    return api.files.mkdir(name)
  }
}
