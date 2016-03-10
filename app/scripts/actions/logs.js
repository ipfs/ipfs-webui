import {action} from './utils'

export const LOGS = {
  RECEIVE: 'LOGS_RECEIVE',
  CANCEL: 'LOGS_CANCEL',
  TOGGLE_TAIL: 'TOGGLE_TAIL',
  SELECT_SYSTEM: 'SELECT_SYSTEM'
}

export const logs = {
  receive: (response) => action(LOGS.RECEIVE, {response}),
  cancel: () => action(LOGS.CANCEL),
  toggleTail: () => action(LOGS.TOGGLE_TAIL),
  selectSystem: (system) => action(LOGS.SELECT_SYSTEM, {system})
}
