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
