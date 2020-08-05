import { sortByName, sortBySize } from '../../lib/sort'
import { ACTIONS, IS_MAC, SORTING } from './consts'

/**
 * @param {string} basename
 * @param {Function} action
 * @param {Object} [options]
 * @param {boolean} [options.mfsOnly]
 * @returns {(...args:any[]) => (...args:any[]) => Promise<any>}
 */
export const make = (basename, action, options = {}) => (...args) => async (args2) => {
  const id = Symbol(basename)
  const { dispatch, getIpfs, store } = args2
  dispatch({ type: `FILES_${basename}_STARTED`, payload: { id } })

  let data

  if (options.mfsOnly) {
    const info = store.selectFilesPathInfo()
    if (!info || !info.isMfs) {
      // musn't happen
      return
    }
  }

  try {
    data = await action(getIpfs(), ...args, id, args2)

    const paths = args[0] ? args[0].flat() : []

    dispatch({
      type: `FILES_${basename}_FINISHED`,
      payload: {
        id,
        ...data,
        paths
      }
    })

    // Rename specific logic
    if (basename === ACTIONS.MOVE) {
      const src = args[0]
      const dst = args[1]

      if (src === store.selectFiles().path) {
        await store.doUpdateHash(dst)
      }
    }

    // Delete specific logic
    if (basename === ACTIONS.DELETE) {
      const src = args[0][0]

      let path = src.split('/')
      path.pop()
      path = path.join('/')

      await store.doUpdateHash(path)
    }
  } catch (error) {
    if (!error.code) {
      error.code = `ERR_${basename}`
    }

    console.error(error)
    dispatch({ type: `FILES_${basename}_FAILED`, payload: { id, error } })
  } finally {
    if (basename !== ACTIONS.FETCH) {
      await store.doFilesFetch()
    }

    if (basename === ACTIONS.PIN_ADD || basename === ACTIONS.PIN_REMOVE) {
      await store.doPinsFetch()
    }
  }

  return data
}

/**
 * @template {{name:string, type:string, cumulativeSize?:number, size:number}} T
 * @param {T[]} files
 * @param {Object} sorting
 * @param {boolean} [sorting.asc]
 * @param {import('./consts').SORTING} [sorting.by]
 * @returns {T[]}
 */
export const sortFiles = (files, sorting) => {
  const sortDir = sorting.asc ? 1 : -1
  const nameSort = sortByName(sortDir)
  const sizeSort = sortBySize(sortDir)

  return files.sort((a, b) => {
    if (a.type === b.type || IS_MAC) {
      if (sorting.by === SORTING.BY_NAME) {
        return nameSort(a.name, b.name)
      } else {
        return sizeSort(a.cumulativeSize || a.size, b.cumulativeSize || b.size)
      }
    }

    if (a.type === 'directory') {
      return -1
    } else {
      return 1
    }
  })
}

/**
 * @typedef {Object} Info
 * @property {string} path
 * @property {string} realPath
 * @property {boolean} isMfs
 * @property {boolean} isPins
 * @property {boolean} isRoot
 *
 * @param {string} path
 * @param {boolean} uriDecode
 * @returns {Info|void}
 */
export const infoFromPath = (path, uriDecode = true) => {
  const info = {
    path: path,
    realPath: '',
    isMfs: false,
    isPins: false,
    isRoot: false
  }

  /**
   * @param {string} prefix
   */
  const check = (prefix) => {
    info.realPath = info.path.substr(prefix.length).trim() || '/'
    info.isRoot = info.realPath === '/'
  }

  if (info.path.startsWith('/ipns') || info.path.startsWith('/ipfs')) {
    info.realPath = info.path
    info.isRoot = info.path === '/ipns' || info.path === '/ipfs'
  } else if (info.path.startsWith('/files')) {
    check('/files')
    info.isMfs = true
  } else if (info.path.startsWith('/pins')) {
    check('/pins')
    info.isPins = true

    if (info.realPath !== '/') {
      info.realPath = `/ipfs${info.realPath}`
    }
  } else {
    return
  }

  if (info.path.endsWith('/') && info.realPath !== '/') {
    info.path = info.path.substring(0, info.path.length - 1)
    info.realPath = info.realPath.substring(0, info.realPath.length - 1)
  }

  if (uriDecode) {
    info.realPath = decodeURIComponent(info.realPath)
    info.path = decodeURIComponent(info.path)
  }

  return info
}
