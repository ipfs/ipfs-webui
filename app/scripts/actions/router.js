import {action} from './utils'

export const UPDATE_ROUTER_STATE = 'UPDATE_ROUTER_STATE'
export const NAVIGATE = 'NAVIGATE'

export const updateRouterState = (state) => action(UPDATE_ROUTER_STATE, {state})
export const navigate = (pathname) => action(NAVIGATE, {pathname})
