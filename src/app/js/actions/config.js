import {action, createRequestTypes} from './utils'

export const CONFIG = {
  LOAD: createRequestTypes('CONFIG_LOAD')
}

export const config = {
  load: {
    request: () => action(CONFIG.LOAD.REQUEST),
    success: (response) => action(CONFIG.LOAD.SUCCESS, {response}),
    failure: (error) => action(CONFIG.LOAD.FAILURE, {error})
  }
}
