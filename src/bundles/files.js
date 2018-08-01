import { join, dirname } from 'path'
import { createSelector } from 'redux-bundler'
import { getDownloadLink, filesToStreams } from '../lib/files'
import ms from 'milliseconds'

export const actions = {
  FETCH: 'FETCH',
  MOVE: 'MOVE',
  COPY: 'COPY',
  DELETE: 'DELETE',
  MAKE_DIR: 'MAKEDIR',
  WRITE: 'WRITE',
  DOWNLOAD_LINK: 'DOWNLOADLINK',
  ADD_BY_PATH: 'ADDBYPATH'
}

const make = (basename, action) => (...args) => async (args2) => {
  const id = Symbol(basename)
  const { dispatch, getIpfs, store } = args2
  dispatch({ type: `FILES_${basename}_STARTED`, payload: { id } })

  let data

  try {
    data = await action(getIpfs(), ...args, id, args2)
    dispatch({ type: `FILES_${basename}_FINISHED`, payload: { id, ...data } })
  } catch (error) {
    dispatch({ type: `FILES_${basename}_FAILED`, payload: { id, error } })
  } finally {
    if (basename !== actions.FETCH) {
      await store.doFilesFetch()
    }
  }

  return data
}

const fetchFiles = make(actions.FETCH, async (ipfs, id, { store }) => {
  const path = store.selectFilesPathFromHash()
  const stats = await ipfs.files.stat(path)

  if (stats.type === 'file') {
    stats.name = path

    return {
      path: path,
      fetched: Date.now(),
      type: 'file',
      stats: stats,
      read: () => ipfs.files.read(path)
    }
  }

  // Otherwise get the directory info
  let res = await ipfs.files.ls(path, {l: true})

  if (res) {
    res = res.map(file => {
      // FIX: open PR on js-ipfs-api
      file.type = file.type === 0 ? 'file' : 'directory'
      file.path = join(path, file.name)
      return file
    })
  }

  return {
    path: path,
    fetched: Date.now(),
    type: 'directory',
    content: res
  }
})

const defaultState = {
  pageContent: null,
  pending: [],
  finished: [],
  failed: []
}

export default (opts = {}) => {
  opts.staleAfter = opts.staleAfter || ms.minutes(1)
  opts.baseUrl = opts.baseUrl || '/files'

  return {
    name: 'files',

    reducer: (state = defaultState, action) => {
      if (!action.type.startsWith('FILES_')) {
        return state
      }

      if (action.type === 'FILES_DISMISS_ERRORS') {
        return {
          ...state,
          failed: []
        }
      }

      const [ type, status ] = action.type.split('_').splice(1)
      const { id, ...data } = action.payload

      if (status === 'STARTED') {
        return {
          ...state,
          pending: [
            ...state.pending,
            {
              type: type,
              id: id,
              start: Date.now(),
              data: data
            }
          ]
        }
      } else if (status === 'UPDATED') {
        const action = state.pending.find(a => a.id === id)

        return {
          ...state,
          pending: [
            ...state.pending.filter(a => a.id !== id),
            {
              ...action,
              data: data
            }
          ]
        }
      } else if (status === 'FAILED') {
        const action = state.pending.find(a => a.id === id)

        return {
          ...state,
          pending: state.pending.filter(a => a.id !== id),
          failed: [
            ...state.failed,
            {
              ...action,
              end: Date.now(),
              error: data.error
            }
          ]
        }
      } else if (status === 'FINISHED') {
        const action = state.pending.find(a => a.id === id)
        let additional

        if (type === actions.FETCH) {
          additional = {
            pageContent: data
          }
        }

        return {
          ...state,
          ...additional,
          pending: state.pending.filter(a => a.id !== id),
          finished: [
            ...state.finished,
            {
              ...action,
              data: data,
              end: Date.now()
            }
          ]
        }
      }

      return state
    },

    doFilesFetch: () => async ({ store, ...args }) => {
      const isReady = store.selectIpfsReady()
      const isFetching = store.selectFilesIsFetching()

      if (isReady && !isFetching) {
        fetchFiles()({ store, ...args })
      }
    },

    doFilesWrite: make(actions.WRITE, async (ipfs, root, rawFiles, id, { dispatch }) => {
      const { streams, totalSize } = await filesToStreams(rawFiles)

      const updateProgress = (progress) => {
        dispatch({ type: 'FILES_WRITE_UPDATED', payload: { id: id, progress } })
      }

      updateProgress(0)

      let sent = 0

      for (const file of streams) {
        const dir = join(root, dirname(file.name))
        await ipfs.files.mkdir(dir, { parents: true })
        let alreadySent = 0

        const res = await ipfs.add(file.content, {
          pin: false,
          // eslint-disable-next-line
          progress: (bytes) => {
            sent = sent + bytes - alreadySent
            alreadySent = bytes
            updateProgress(sent / totalSize * 100)
          }
        })

        const src = `/ipfs/${res[res.length - 1].hash}`
        const dst = join(root, file.name)
        await ipfs.files.cp([src, dst])

        sent = sent - alreadySent + file.size
        updateProgress(sent / totalSize * 100)
      }

      updateProgress(100)
    }),

    doFilesDelete: make(actions.DELETE, (ipfs, files) => {
      const promises = files.map(file => ipfs.files.rm(file, { recursive: true }))
      return Promise.all(promises)
    }),

    doFilesAddPath: make(actions.ADD_BY_PATH, (ipfs, root, src) => {
      const name = src.split('/').pop()
      const dst = join(root, name)
      return ipfs.files.cp([src, dst])
    }),

    doFilesDownloadLink: make(actions.DOWNLOAD_LINK, async (ipfs, files, id, { store }) => {
      const apiUrl = store.selectApiUrl()
      const gatewayUrl = store.selectGatewayUrl()
      return getDownloadLink(files, gatewayUrl, apiUrl, ipfs)
    }),

    doFilesMove: make(actions.MOVE, (ipfs, src, dst) => ipfs.files.mv([src, dst])),

    doFilesCopy: make(actions.COPY, (ipfs, src, dst) => ipfs.files.cp([src, dst])),

    doFilesMakeDir: make(actions.MAKE_DIR, (ipfs, path) => ipfs.files.mkdir(path, { parents: true })),

    doFilesDismissErrors: () => async ({ dispatch }) => dispatch({ type: 'FILES_DISMISS_ERRORS' }),

    doFilesNavigateTo: (path) => async ({ store }) => {
      const link = path.split('/').map(p => encodeURIComponent(p)).join('/')
      store.doUpdateHash(`${opts.baseUrl}${link}`)
    },

    reactFilesFetch: createSelector(
      'selectFiles',
      'selectFilesIsFetching',
      'selectAppTime',
      (files, isFetching, appTime) => {
        if (!isFetching && files && appTime - files.fetched >= opts.staleAfter) {
          return { actionCreator: 'doFilesFetch' }
        }
      }
    ),

    selectFiles: (state) => state.files.pageContent,

    selectFilesIsFetching: (state) => state.files.pending.some(a => a.type === actions.FETCH),

    selectWriteFilesProgress: (state) => {
      const writes = state.files.pending.filter(s => s.type === actions.WRITE && s.data.progress)

      if (writes.length === 0) {
        return null
      }

      const sum = writes.reduce((acc, s) => s.data.progress + acc, 0)
      return sum / writes.length
    },

    selectFilesHasError: (state) => state.files.failed.length > 0,

    selectFilesErrors: (state) => state.files.failed,

    selectFilesPathFromHash: createSelector(
      'selectRouteInfo',
      (routeInfo) => {
        if (!routeInfo.url.startsWith(opts.baseUrl)) return
        if (!routeInfo.params.path) return
        return decodeURIComponent(routeInfo.params.path)
      }
    )
  }
}
