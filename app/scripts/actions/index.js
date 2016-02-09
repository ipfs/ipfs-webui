const REQUEST = 'REQUEST'
const SUCCESS = 'SUCCESS'
const FAILURE = 'FAILURE'

function createRequestTypes (base) {
  const res = {}
  const types = [REQUEST, SUCCESS, FAILURE]
  types.forEach((type) => {
    res[type] = `${base}_${type}`
  })

  return res
}

export const ID = createRequestTypes('ID')

export const LOGS = {
  RECEIVE: 'LOGS_RECEIVE',
  CANCEL: 'LOGS_CANCEL'
}

export const UPDATE_ROUTER_STATE = 'UPDATE_ROUTER_STATE'
export const NAVIGATE = 'NAVIGATE'
export const LOAD_HOME_PAGE = 'LOAD_HOME_PAGE'
export const LOAD_LOGS_PAGE = 'LOAD_LOGS_PAGE'
export const LEAVE_LOGS_PAGE = 'LEAVE_LOGS_PAGE'
export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

function action (type, payload = {}) {
  return {type, ...payload}
}

export const id = {
  request: () => action(ID.REQUEST),
  success: (response) => action(ID.SUCCESS, {response}),
  failure: (error) => action(ID.FAILURE, {error})
}

export const logs = {
  receive: (response) => action(LOGS.RECEIVE, {response}),
  cancel: () => action(LOGS.CANCEL)
}

export const updateRouterState = (state) => action(UPDATE_ROUTER_STATE, {state})
export const navigate = (pathname) => action(NAVIGATE, {pathname})
export const loadHomePage = () => action(LOAD_HOME_PAGE)
export const loadLogsPage = () => action(LOAD_LOGS_PAGE)
export const leaveLogsPage = () => action(LEAVE_LOGS_PAGE)

export const resetErrorMessage = () => action(RESET_ERROR_MESSAGE)
