import { DefaultApi } from 'ipfs-search-client'

const gatewayURL = 'https://gateway.ipfs.io'

export const api = new DefaultApi()

export const maxPages = 100
export const batchSize = 15

// export const apiMetadataQuery = (hash) => {
//   return api.metadatahashGet(hash).then(({ metadata }) => {
//     return {
//       hash,
//       author: metadata.Author?.[0],
//       title: metadata.title?.[0] || metadata.resourceName?.[0],
//       mimetype: metadata['Content-Type']?.[0],
//       creation_date: metadata['Creation-Date']?.[0]
//     }
//   })
// }

export const ipfsApiSearch = (query, type, batch = 0) => {
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
