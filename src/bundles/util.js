// @ts-check

/**
  * @template State, Message, Ext, Extra
  * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} BundlerContext
  */

/**
 * @template X, T
 * @typedef {() => Promise<T> | T} Task
 */

/**
 * @template X = Error
 * @template T
 * @typedef {Failure<X>|Success<T>} Result
 */

/**
 * @template T
 * @typedef {Object} Success
 * @property {true} ok
 * @property {T} value
 */

/**
 * @template X = Error
 * @typedef {Object} Failure
 * @property {false} ok
 * @property {X} error
 */

/**
 * @template I
 * @typedef {Object} Init
 * @property {'Init'} status
 * @property {Symbol} id
 * @property {I} init
 */

/**
 * @template Fail = Error
 * @template Success
 * @typedef {Object} Exit
 * @property {'Exit'} status
 * @property {Symbol} id
 * @property {number} duration
 * @property {Result<Fail, Success>} result
 */

/**
 * @template Fail = Error
 * @template Success
 * @template Input = void
 * @typedef {Init<Input>|Exit<Fail, Success>} TaskState
 */

/**
 * @template {string} Name
 * @template Fail - Type of the failure error
 * @template Success - Type of the success value
 * @template Init - Initial type
 * @typedef {Object} Perform
 * @property {Name} type
 * @property {TaskState<Fail, Success, Init>} task
 */

/**
 * @template {string} Name - Name of the task which, correponds to `.type` of
 * dispatched actions.
 * @template Config - Initial data
 * @template Return - Return type of the task, which will correspond to
 * `.job.result.value` of dispatched action on succefully completed task.
 * @template {Object} StoreExt
 * @template {Object} Extra
 * @template {BundlerContext<any, Perform<Name, Error, Return, Config>, StoreExt, Extra>} Context
 *
 * @param {Context} context
 * @param {Name} name - Name of the task
 * @param {(context:Context) => Promise<Return> | Return} task
 * @param {Config[]} rest
 * @returns {Promise<Return>}
 */
export const perform = async (context, name, task, ...[init]) =>
  // eslint-disable-next-line require-yield
  spawn(context, name, async function * (context) {
    return await task(context)
  }, init)

/**
 * @template Message
 * @typedef {Object} Send
 * @property {Symbol} id
 * @property {'Send'} status
 * @property {Message} message
 */

/**
 * @template Message
 * @template Fail
 * @template Success
 * @template Input = void
 * @typedef {Init<Input>|Send<Message>|Exit<Fail, Success>} ProcessState
 */

/**
 * @template {string} Name
 * @template Message - Type of messages it produces
 * @template Fail - Type of the failure error
 * @template Success - Type of the success value
 * @template Init = void - Initial type
 * @typedef {Object} Spawn
 * @property {Name} type
 * @property {ProcessState<Message, Fail, Success, Init>} task
 */

/**
 * @template {string} Name - Name of the task which, correponds to `.type` of
 * dispatched actions.
 * @template State - Type of yielded value by a the generator, which will
 * correspond to `.job.state` of dispatched actions while task is pending.
 * @template Message - Messages process produces
 * @template Config - Init options
 * @template Return - Return type of the task, which will correspond to
 * `.job.result.value` of dispatched action on succefully completed task.
 * @template {Object} StoreExt
 * @template {Object} Extra
 * @template {BundlerContext<State, Spawn<Name, Message, Error, Return, Config>, StoreExt, Extra>} Context
 *
 * @param {Context} context
 * @param {Name} name - Name of the task
 * @param {(context:Context) => AsyncGenerator<Message, Return, void>} task
 * @param {Config[]} rest
 * @returns {Promise<Return>}
 */
export const spawn = async (context, name, task, ...[init]) => {
  // Generate unique id for this task
  const id = Symbol(name)
  const type = name
  const start = performance.now()

  try {
    context.dispatch({ type, task: { id, status: 'Init', init } })

    const process = task(context)
    while (true) {
      const next = await process.next()
      if (next.done) {
        const { value } = next
        context.dispatch({
          type,
          task: {
            id,
            status: 'Exit',
            duration: performance.now() - start,
            result: {
              ok: true, value
            }
          }
        })
        return value
      } else {
        const { value } = next
        context.dispatch({
          type,
          task: {
            id,
            status: 'Send',
            message: value
          }
        })
      }
    }
  } catch (error) {
    context.dispatch({
      type,
      task: {
        id,
        status: 'Exit',
        duration: performance.now() - start,
        result: { ok: false, error }
      }
    })
    // Propagate error to a caller.
    throw error
  }
}
