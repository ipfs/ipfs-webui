// @ts-check

/**
  * @template State, Message, Ext, Extra
  * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} BundlerContext
  */

/**
 * A Result is the result of a computation that may fail.
 *
 * @template X = Error
 * @template T
 * @typedef {{ok:false, error:X} | {ok:true, value: T}} Result
 */

/**
 * Represents task in it's initialization phase.
 *
 * @template Init
 * @typedef {Object} InitState
 * @property {'Init'} status
 * @property {Symbol} id - Unique identifier of this task.
 * @property {Init} init - Initialization paramater provided on spawn.
 */

/**
 * Reperesents task in it's completion phase.
 *
 * @template Failure = Error - Type of `result.error` if failed.
 * @template Success - Type of `result.value` if succeeded.
 * @typedef {Object} ExitState
 * @property {'Exit'} status
 * @property {Symbol} id - Unique identifier of this task.
 * @property {number} duration - Time spend from initialization to completion.
 * @property {Result<Failure, Success>} result - Result of the task.
 */

/**
 * Type reperesenting a state of the performed task. It is state machine
 * representing task state that will initial be in `InitState` and on completion
 * transition to `ExitState`.
 *
 * @template Failure = Error
 * @template Success
 * @template Init = void
 * @typedef {InitState<Init>|ExitState<Failure, Success>} PerformState
 */

/**
 * Type representing actions dispatched when performing a task.
 *
 * @template {string} Type - String literal used as `action.type`.
 * @template Failure - Type of the `result.error` for a failed task.
 * @template Success - Type of the `result.value` for the successfull task.
 * @template Init - Initialization parameter passed to perform.
 * @typedef {Object} Perform
 * @property {Type} type
 * @property {PerformState<Failure, Success, Init>} task
 */

/**
 * Takes the action `type`, a `task` (in form of async function) and an optional
 * `init` parameters to produce a `doX` style action creator. On exectuion
 * `{ type, task }` actions will be dispatched, where `task` represents a state
 * (machine) of the executed task, which proceeds as follows:
 *
 * - At the start of the execution, task will have an `Init` status, which is
 *  dispatched just once: `{ status: 'Init' id: Symbol, init: Init}`. An `id`
 *  is unique identifier of the task (kind of like PID) and `init` is an
 *  optional parameter that was passed to `perform` (Which can be useful in
 *  certain reducers and middleware that need to keep track of state).
 *
 * - Once task is finishes, action with status `Exit` is dispatced just once:
 *   `{ status: 'Exit', id: Symbol, duration: number, result: Result<Error, Success> }`
 *   with some new new fields:
 *     - `duration` - Is a time it took a task from `Init` to `Exit` in ms.
 *     - `result` - Is a result of the task. On succesful completion it is
 *       `{ok:true, value:Success}` (value is return value of the async
 *       function). On failure it is `{ok:false, error:Error}` (`error` is an
 *       expception thrown, or a rejection reason of the promise).
 *
 * @template {string} Type - Corresponds to `action.type` for all the actions
 * @template Success - Type of the `action.task.result.vaule` when task is
 * complete successfully. It is also a value of the promise returned by
 * running `store.doX` created by this decorator.
 * @template Init - Type of the initialization paramater.
 * @template State - Type of the `context.getState()` for this task.
 * @template {Object} StoreExt - Store extension.
 * @template {Object} ContextExt - Context extension
 * @template {BundlerContext<State, Perform<Type, Error, Success, Init>, StoreExt, ContextExt>} Context
 *
 * @param {Type} type - Type of the actions this will dispatch.
 * @param {(context:Context) => Promise<Success>} task
 * @param {Init[]} rest
 * @returns {(context:Context) => Promise<Success>}
 */
export const perform = (type, task, ...[init]) =>
  // eslint-disable-next-line require-yield
  spawn(type, async function * (context) {
    return await task(context)
  }, init)

/**
 * @template Message
 * @typedef {Object} SendState
 * @property {Symbol} id
 * @property {'Send'} status
 * @property {Message} message
 */

/**
 * Type reperesenting a state of the spawned task. It is state machine that will
 * transition from InitState -> SendState -> ExitState. It is guaranteed that
 * spawned task will be in `InitState` and `ExitState` exactly once. It is also
 * guaranteed that task can be in `SendState` 0 or 1 or more times between
 * `InitState` and `ExitStates`.
 *
 * @template Message
 * @template Fail
 * @template Success
 * @template Input = void
 * @typedef {InitState<Input>|SendState<Message>|ExitState<Fail, Success>} SpawnState
 */

/**
 * Represents actions that will be dispatched by the `spawn`-ed task.
 * This is more advanced superset of `Perform` as spawned tasks can send
 * messages during execution.
 *
 * @template {string} Name
 * @template Message - Type of messages it produces
 * @template Fail - Type of the failure error
 * @template Success - Type of the success value
 * @template Init = void - Initial type
 * @typedef {Object} Spawn
 * @property {Name} type
 * @property {SpawnState<Message, Fail, Success, Init>} task
 */

/**
 * This is more advanced form of `perform`, which can be used to execute tasks
 * that need to send messages (that turn into dispatched actions) during
 * execution.
 *
 * It takes the action `type`, a `task` (in form of async generator) and an
 * optional `init` parameters to produce a `doX` style action creator. On
 * exectuion `{ type, task }` actions will be dispatched, where `task`
 * represents a state (machine) of the executed task, which proceeds as follows:
 *
 * - At the start of the execution, task will have an `Init` status, which is
 *  dispatched just once: `{ status: 'Init' id: Symbol, init: Init}`. An `id`
 *  is unique identifier of the task (kind of like PID) and `init` is an
 *  optional parameter that was passed to `perform` (Which can be useful in
 *  certain reducers and middleware that need to keep track of state).
 *
 * - During execution task may produce messages by yielding them. On each
 *   message dispatche actions task will have a `Send` status:
 *  `{ status: 'Send', id: Symbol, message: Message }`. Task can produce >= 0
 *  such actions. (If your task produces 0 messages you want to use perform
 *   instead).
 *
 Once task is finishes, action with status `Exit` is dispatced just once:
 *   `{ status: 'Exit', id: Symbol, duration: number, result: Result<Error, Success> }`
 *   with some new new fields:
 *     - `duration` - Is a time it took a task from `Init` to `Exit` in ms.
 *     - `result` - Is a result of the task. On succesful completion it is
 *       `{ok:true, value:Success}` (value is return value of the async
 *       generator). On failure it is `{ok:false, error:Error}` (`error` is an
 *       expception thrown, or a rejection reason of the promise).
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
 * @template {Object} StoreExt - Store extension.
 * @template {Object} ContextExt - Context extension
 * @template {BundlerContext<State, Spawn<Type, Message, Error, Success, Init>, StoreExt, ContextExt>} Context
 *
 * @param {Type} type - Type of the actions this will dispatch.
 * @param {(context:Context) => AsyncGenerator<Message, Success, void>} task - Task
 * @param {Init[]} rest - Optinal initialization parameter.
 * @returns {(context:Context) => Promise<Success>}
 */export const spawn = (type, task, ...[init]) => async (context) => {
  // Generate unique id for this task
  const id = Symbol(type)
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
  } catch (err) {
    const error = /** @type {Error} */(err)
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
