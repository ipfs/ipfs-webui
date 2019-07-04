import { sortByName, sortBySize } from '../../lib/sort'
import { ACTIONS, IS_MAC, SORTING } from './consts'

export const make = (basename, action, options = {}) => (...args) => async (args2) => {
  const id = Symbol(basename)
  const { dispatch, getIpfs, store } = args2
  dispatch({ type: `FILES_${basename}_STARTED`, payload: { id } })

  let data

  if (options.mfsOnly) {
    if (!store.selectFilesIsMfs()) {
      // musn't happen
      return
    }
  }

  try {
    data = await action(getIpfs(), ...args, id, args2)
    dispatch({ type: `FILES_${basename}_FINISHED`, payload: { id, ...data } })

    // Rename specific logic
    if (basename === ACTIONS.MOVE) {
      const src = args[0][0]
      const dst = args[0][1]

      if (src === store.selectFiles().path) {
        await store.doUpdateHash(`/files${dst}`)
      }
    }

    // Delete specific logic
    if (basename === ACTIONS.DELETE) {
      const src = args[0][0]

      let path = src.split('/')
      path.pop()
      path = path.join('/')

      await store.doUpdateHash(`/files${path}`)
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
