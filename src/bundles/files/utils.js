import { sortByName, sortBySize } from '../../lib/sort'
import { IS_MAC, SORTING } from './consts'
import * as IO from '../task'

/**
 * @template State, Message, Ext = {}
 * @typedef {import('redux-bundler').Store<State, Message, Ext>} ReduxStore
 */

/**
  * @template State, Message, Ext, Extra
  * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} BundlerContext
  */

/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {import('./protocol').Model} Model
 * @typedef {import('./protocol').Message} Message
 * @typedef {import('cids')} CID
 * @typedef {import('./selectors').Selectors} Selectors
 * @typedef {import('./actions').Actions} Actions
 * @typedef {import('../ipfs-provider').IPFSProviderStore} IPFSProviderStore
 * @typedef {import('../connected').Selectors} ConnectedSelectors
 *
 * @typedef {Object} ConfigSelectors
 * @property {function():string} selectApiUrl
 * @property {function():string} selectGatewayUrl
 *
 * @typedef {Object} UnkonwActions
 * @property {function(string):Promise<unknown>} doUpdateHash
 * @typedef {Selectors & Actions & IPFSProviderStore & ConnectedSelectors & ConfigSelectors & UnkonwActions} StoreExt
 * @typedef {import('redux-bundler').Store<Model, Message, StoreExt>} Store
 * @typedef {import('redux-bundler').Context<Model, Message, StoreExt, GetIPFS>} Context
 * @typedef {import('./protocol').PageContent} PageContent
 * @typedef {import('../ipfs-provider').Extra} GetIPFS
 */

/**
 * Utilit function takes a task name and task (in form of async generator) and
 * produces `doX` style action creator that will execute a task and dispatch
 * actions in form of `{type: name, job: Job<State, Error, Return>}` as it makes
 * progress.
 *
 * A `.job` property of dispatched action will correspond to on of the states:
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
 * @template Name, Message, Error, Return, Init
 * @typedef {import('../task').Spawn<Name, Message, Error, Return, Init>} Spawn
 */

/**
 * @template {string} Name - Name of the task which, correponds to `.type` of
 * dispatched actions.
 * @template State
 * @template Out - Messages process produces
 * @template Config - Init options
 * @template Return - Return type of the task, which will correspond to
 * `.job.result.value` of dispatched action on succefully completed task.
 * @template {BundlerContext<State, Spawn<Name, Out, Error, Return, Config>, StoreExt, GetIPFS>} Ctx
 *
 * @param {Name} name - Name of the task
 * @param {(service:IPFSService, context:Ctx) => AsyncGenerator<Out, Return, void>} task
 * @param {Config[]} rest
 * @returns {(context:Ctx) => Promise<Return>}
 */
export const spawn = (name, task, ...[init]) => async (context) => {
  const ipfs = context.getIpfs()
  if (ipfs == null) {
    throw Error('IPFS node was not found')
  } else {
    const routine = IO.spawn(
      name,
      /**
       * @param {Ctx} context
       * @returns {AsyncGenerator<Out, Return, void>}}
       */
      async function * (context) {
        const process = task(ipfs, context)
        while (true) {
          const next = await process.next()
          if (next.done) {
            return next.value
          } else {
            yield next.value
          }
        }
      },
      init
    )

    return await routine(context)
  }
}

/**
 * @template Name, Error, Return, Init
 * @typedef {import('../task').Perform<Name, Error, Return, Init>} Perform
 */

/**
 * @template {string} Name - Name of the task which, correponds to `.type` of
 * dispatched actions.
 * @template Config - Initial data
 * @template Return - Return type of the task, which will correspond to
 * `.job.result.value` of dispatched action on succefully completed task.
 * @template {StoreExt} Ext
 * @template {GetIPFS} Extra
 * @template {BundlerContext<any, Perform<Name, Error, Return, Config>, Ext, Extra>} Ctx
 *
 * @param {Name} name - Name of the task
 * @param {(service:IPFSService, context:Ctx) => Promise<Return> | Return} task
 * @param {Config[]} rest
 * @returns {(context:Ctx) => Promise<Return>}
 */
export const perform = (name, task, ...[init]) =>
  // eslint-disable-next-line require-yield
  spawn(name, async function * (service, context) {
    return await task(service, context)
  }, init)

/**
 * Creates an acton creator that just dispatches given action.
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
 * @param {Selectors} store
 */
export const ensureMFS = (store) => {
  const info = store.selectFilesPathInfo()
  if (!info || !info.isMfs) {
    throw new Error('Unable to perform task if not in MFS')
  }
}
