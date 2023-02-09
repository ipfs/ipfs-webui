import { sortByName, sortBySize } from '../../lib/sort.js'
import { IS_MAC, SORTING } from './consts.js'
import * as Task from '../task.js'

/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {import('./actions').Ext} Ext
 * @typedef {import('./actions').Extra} Extra
 */

/**
  * @template State, Message, Ext, Extra
  * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} BundlerContext
  */

/**
 * Utility function that takes a task name and task (in form of async generator) and
 * produces `doX` style action creator that will execute a task and dispatch
 * actions in form of `{type: name, job: Job<State, Error, Return>}` as it makes
 * progress.
 *
 * A `.job` property of dispatched action will correspond to one of the states:
 *
 * 1. `{ status: 'Idle', id: Symbol }` - State just before task is executed.
 * 2. `{ status: 'Pending', id: Symbol, state: State }` - State while task is in
 *    progress. Each yielded value will cause this action and will correspond
 *    to `state` field.
 * 3. `{ status: 'Done', id: Symbol, value: Return }` - State when task is
 *    successfully complete.
 * 4. `{ status: 'Failed', id: Symbol, error: Error }` - State when task is
 *    failed do to error.
 *
 * template {string} Name - Name of the task which, correponds to `.type` of
 * dispatched actions.
 * template State - Type of yielded value by a the generator, which will
 * correspond to `.job.state` of dispatched actions while task is pending.
 * template Return - Return type of the task, which will correspond to
 * `.job.result.value` of dispatched action on succefully completed task.
 * template {BundlerContext<State, Job<Name, State, Error, Return>, StoreExt, GetIPFS>} Ctx
 *
 * param {Name} name - Name of the task
 * param {(service:IPFSService, context:Ctx) => AsyncGenerator<State, Return, void>} task
 * returns {(context:Ctx) => Promise<Return>}
 */

/**
 * @template Name, Message, Failure, Success, Init
 * @typedef {import('../task').Spawn<Name, Message, Failure, Success, Init>} Spawn
 */

/**
 * Specialized version of `Task.spawn` which will only spawn a task if
 * `context.getIpfs()` returns an `IPFSService` passing it into the task as a
 * first argument. Otherwise it fails without dispatching any actions.
 *
 * @template {string} Type - Corresponds to `action.type` for all the actions
 * that this task will dispatch.
 * @template Message - Type of messages that task will produce (by yielding).
 * Which correspond to `action.task.message` when `action.status`
 * is `Send`.
 * @template Success - Type of the `action.task.result.vaule` when task is
 * complete successfully. It is also a value of the promise returned by
 * running `store.doX` created by this decorator.
 * @template Init - Type of the initialization paramater.
 * @template State - Type of the `context.getState()` for this task.
 * @template {BundlerContext<State, Spawn<Type, Message, Error, Success, Init>, Ext, Extra>} Context
 *
 * @param {Type} type - Type of the actions this will dispatch.
 * @param {(service:IPFSService, context:Context) => AsyncGenerator<Message, Success, void>} task - Task
 * @param {Init[]} rest - Optinal initialization parameter.
 * @returns {(context:Context) => Promise<Success>}
 */
export const spawn = (type, task, ...[init]) => async (context) => {
  const ipfs = context.getIpfs()
  if (ipfs == null) {
    throw Error('IPFS node was not found')
  } else {
    const spawn = Task.spawn(
      type,
      /**
       * @param {Context} context
       * @returns {AsyncGenerator<Message, Success, void>}}
       */
      async function * (context) {
        const process = task(ipfs, context)
        while (true) {
          const next = await process.next()
          if (next.done) {
            return await next.value
          } else {
            yield next.value
          }
        }
      },
      init
    )

    return await spawn(context)
  }
}

/**
 * @template Name, Failure, Success, Init
 * @typedef {import('../task').Perform<Name, Failure, Success, Init>} Perform
 */

/**
 * Specialized version of `Task.perform` which will only perform a task if
 * `context.getIpfs()` returns an `IPFSService` passing it into the task as a
 * first argument. Otherwise it fails without dispatching any actions.
 *
 * @template {string} Type - Type of the task which, correponds to `.type` of
 * dispatched actions.
 * @template Success - Return type of the task, which will correspond to
 * `.job.result.value` of dispatched action on succefully completed task.
 * @template Init - Initial data
 * @template State - Type of the `context.getState()` for this task.
 * @template {BundlerContext<State, Perform<Type, Error, Success, Init>, Ext, Extra>} Context
 *
 * @param {Type} type - Type of the actions this will dispatch.
 * @param {(service:IPFSService, context:Context) => Promise<Success>} task
 * @param {Init[]} rest
 * @returns {(context:Context) => Promise<Success>}
 */
export const perform = (type, task, ...[init]) => async (context) => {
  const ipfs = context.getIpfs()
  if (ipfs == null) {
    throw Error('IPFS node was not found')
  } else {
    const perform = Task.perform(
      type,
      /**
       * @param {Context} context
       */
      context => task(ipfs, context),
      init
    )
    return await perform(context)
  }
}

/**
 * Creates an action creator that just dispatches given action.
 * @template T
 * @param {T} action
 * @returns {(context:BundlerContext<any, T, any, any>) => Promise<void>}
 */
export const send = (action) => async ({ store }) => {
  store.dispatch(action)
}

/**
 * @typedef {Object} Sorting
 * @property {boolean} [asc]
 * @property {import('./consts').SORTING} [by]
 */

/**
 * @template {{name:string, type:string, cumulativeSize?:number, size:number}} T
 * @param {T[]} files
 * @param {Sorting} sorting

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
 * @property {boolean} isRoot
 *
 * @param {string} path
 * @param {boolean} uriDecode
 * @returns {Info|void}
 */
export const infoFromPath = (path, uriDecode = true) => {
  const info = {
    path,
    realPath: '',
    isMfs: false,
    isRoot: false
  }

  /**
   * @param {string} prefix
   */
  const check = (prefix) => {
    info.realPath = info.path.substring(prefix.length).trim() || '/'
    info.isRoot = info.realPath === '/'
  }

  if (info.path.startsWith('/ipns') || info.path.startsWith('/ipfs')) {
    info.realPath = info.path
    info.isRoot = info.path === '/ipns' || info.path === '/ipfs'
  } else if (info.path.startsWith('/files')) {
    check('/files')
    info.isMfs = true
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

/**
 * @template T
 * @implements {AsyncIterable<T>}
 */
export class Channel {
  constructor () {
    this.done = false
    /** @type {T[]} */
    this.queue = []
    /** @type {{resolve(value:IteratorResult<T, void>):void, reject(error:any):void}[]} */
    this.pending = []
  }

  [Symbol.asyncIterator] () {
    return this
  }

  /**
   * @returns {Promise<IteratorResult<T, void>>}
   */
  async next () {
    const { done, queue, pending } = this
    if (done) {
      return { done, value: undefined }
    } else if (queue.length > 0) {
      const value = queue[queue.length - 1]
      queue.pop()
      return { done, value }
    } else {
      return await new Promise((resolve, reject) => {
        pending.unshift({ resolve, reject })
      })
    }
  }

  /**
   * @param {T} value
   */
  send (value) {
    const { done, pending, queue } = this
    if (done) {
      throw Error('Channel is closed')
    } else if (pending.length) {
      const promise = pending[pending.length - 1]
      pending.pop()
      promise.resolve({ done, value })
    } else {
      queue.unshift(value)
    }
  }

  /**
   * @param {Error|void} error
   */
  close (error) {
    const { done, pending } = this
    if (done) {
      throw Error('Channel is already closed')
    } else {
      this.done = true
      for (const promise of pending) {
        if (error) {
          promise.reject(error)
        } else {
          promise.resolve({ done: true, value: undefined })
        }
      }
      pending.length = 0
    }
  }
}

/**
 * @param {import('./selectors').Selectors} store
 */
export const ensureMFS = (store) => {
  const info = store.selectFilesPathInfo()
  if (!info || !info.isMfs) {
    throw new Error('Unable to perform task if not in MFS')
  }
}
