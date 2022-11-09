import { DefaultApi } from 'ipfs-search-client'

const gatewayURL = 'https://gateway.ipfs.io'

export const api = new DefaultApi()

export const maxPages = 100
export const batchSize = 15

export function ipfsApiSearch (query, type, batch = 0) {
  if (batch && batch > maxPages) return Promise.reject(Error('API error: Page limit exceeded'))

  const apiType = type === 'directories' ? 'directory' : 'file'

  return api
    .searchGet(query, apiType, batch)
    .then((results) => {
      results.hits.forEach((hit) => {
        if (hit.type !== 'directory') {
          api.metadatahashGet(hit.hash).then((metadata) => {
            // eslint-disable-next-line no-param-reassign
            hit.metadata = metadata
          })
        }
      })
      return results
    })
    .catch((err) => {
      console.error('API error from searchApi.searchGet', err)
      throw err
    })
}

export const getResourceURL = (hash) => {
  return `${gatewayURL}/ipfs/${hash}`
}
