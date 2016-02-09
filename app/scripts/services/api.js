const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)

import API from 'ipfs-api'

const api = new API(host, port)

export const fetchId = () => {
  return new Promise((resolve, reject) => {
    api.id((err, response) => {
      if (err) return reject(err.message || 'Failed api call')
      resolve({response})
    })
  })
}

export const fetchLogStream = () => {
  return new Promise((resolve, reject) => {
    api.log.tail((err, stream) => {
      if (err) return reject(err.message || 'Failed to tail logs')
      resolve(stream)
    })
  })
}

export const createLogSource = () => {
  let deferred

  fetchLogStream().then((stream) => {
    stream.on('data', (msg) => {
      if (deferred) {
        deferred.resolve(msg)
        deferred = null
      }
    })
  })

  return {
    nextMessage () {
      if (!deferred) {
        deferred = {}
        deferred.promise = new Promise((resolve, reject) => {
          deferred.resolve = resolve
          deferred.reject = reject
        })
      }

      return deferred.promise
    }
  }
}
