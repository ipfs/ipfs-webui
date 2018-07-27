import { createSelector } from 'redux-bundler'

export default function (opts) {
  opts = opts || {}
  opts.concurrency = opts.concurrency || 5

  const defaultState = {
    provs: {},
    queue: [],
    resolving: []
  }

  return {
    name: 'filesProvs',

    reducer (state = defaultState, action) {
      if (action.type === 'FILES_PROVS_QUEUED') {
        const hashes = action.payload
        const provs = {}

        hashes.forEach(hash => {
          provs[hash] = {
            state: 'queued'
          }
        })

        return {
          ...state,
          queue: state.queue.concat(hashes),
          provs: {
            ...state.provs,
            ...provs
          }
        }
      }

      if (action.type === 'FILES_PROVS_RESOLVE_STARTED') {
        const { hash } = action.payload

        return {
          ...state,
          queue: state.queue.filter(h => hash !== h),
          resolving: state.resolving.concat(hash),
          provs: {
            ...state.provs,
            [hash]: {
              state: 'resolving'
            }
          }
        }
      }

      if (action.type === 'FILES_PROVS_RESOLVE_FINISHED') {
        const { hash, count } = action.payload

        return {
          ...state,
          resolving: state.resolving.filter(h => h !== hash),
          provs: {
            ...state.provs,
            [hash]: {
              state: 'resolved',
              count: count
            }
          }
        }
      }

      if (action.type === 'FILES_PROVS_RESOLVE_FAILED') {
        const { hash, error } = action.payload

        return {
          ...state,
          resolving: state.resolving.filter(h => h !== hash),
          provs: {
            ...state.provs,
            [hash]: {
              state: 'failed',
              error: error
            }
          }
        }
      }

      return state
    },

    selectFilesProvs: state => state.filesProvs.provs,
    selectFilesProvsQueuing: state => state.filesProvs.queue,
    selectFilesProvsResolving: state => state.filesProvs.resolving,

    doFindProvs: hash => async ({ dispatch, getIpfs }) => {
      dispatch({ type: 'FILES_PROVS_RESOLVE_STARTED', payload: { hash } })

      const ipfs = getIpfs()
      let count

      try {
        const res = await ipfs.dht.findprovs(hash, { timeout: '30s', 'num-providers': 5 })
        count = res.filter(t => t.Type === 4).length
      } catch (err) {
        return dispatch({
          type: 'FILES_PROVS_RESOLVE_FAILED',
          payload: { hash, error: err }
        })
      }

      dispatch({
        type: 'FILES_PROVS_RESOLVE_FINISHED',
        payload: { hash, count }
      })
    },

    reactFindProvs: createSelector(
      'selectIpfsReady',
      'selectFilesProvsQueuing',
      'selectFilesProvsResolving',
      (ipfsReady, queuing, resolving) => {
        if (ipfsReady && queuing.length && resolving.length < opts.concurrency) {
          return {
            actionCreator: 'doFindProvs',
            args: [ queuing[0] ]
          }
        }
      }
    ),

    reactFindProvsQueue: createSelector(
      'selectFiles',
      'selectFilesProvs',
      (files, filesProvs) => {
        if (!files || files.type !== 'directory') {
          return
        }

        const payload = files.content.reduce((acc, { hash }) => {
          if (!filesProvs[hash]) {
            return [...acc, hash]
          } else {
            return acc
          }
        }, [])

        return { type: 'FILES_PROVS_QUEUED', payload }
      }
    )
  }
}
