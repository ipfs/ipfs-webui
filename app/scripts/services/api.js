import API from 'ipfs-api'
import {CANCEL} from 'redux-saga'
import {keyBy, compact, sortBy} from 'lodash-es'
import {lookup} from 'ipfs-geoip'
import {join} from 'path'
import bl from 'bl'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const localApi = new API(host, port)

let logSource

function collect (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(bl((err, buf) => {
      if (err) return reject(err)
      resolve(buf)
    }))
  })
}

function lookupIP (api, ip) {
  return new Promise((resolve, reject) => {
    lookup(api, ip, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
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
  return api.swarm.peers().then((ids) => {
    return keyBy(ids.map((id) => ({
      id: id.peer.toB58String(),
      ...id
    })), 'id')
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

export const peerLocations = (ids, details, api = localApi) => {
  return Promise.all(
    ids
      .filter((id) => {
        const address = details[id].addr.toString()
        // Only ip4 and ip6 addresses
        return address.match(/ip[4,6]/)
      })
      .map((id) => {
        const address = details[id].addr.toString()
        const [, ip] = address.match(/ip[4,6]\/([^/]*)\//)

        return lookupIP(api, ip).then((location) => ({
          ...location,
          id
        })).catch(() => {})
      })
  ).then((locations) => keyBy(compact(locations), 'id'))
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
  },
  rmdir (name, api = localApi) {
    return api.files.rm(name, {recursive: true})
  },

  createFiles (root, files, api = localApi) {
    // root is the directory we want to store the files in
    return Promise.all(files.map((file) => {
      const target = join(root, file.name)
      return api.files.write(target, file.content, {create: true})
    }))
  },

  stat (name, api = localApi) {
    return api.files.stat(name)
  },

  read (name, api = localApi) {
    return api.files.read(name).then(collect)
  }
}

export const getConfig = (api = localApi) => {
  return api.config.get()
  .then((res) => JSON.parse(res.toString()))
}

export const saveConfig = (config, api = localApi) => {
  return api.config.replace(config)
}
