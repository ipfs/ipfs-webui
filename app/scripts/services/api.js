import API from 'ipfs-api'
import {CANCEL} from 'redux-saga'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const localApi = new API(host, port)

let logSource

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
