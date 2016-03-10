import {action, createRequestTypes} from './utils'

export const ID = createRequestTypes('ID')

export const id = {
  request: () => action(ID.REQUEST),
  success: (response) => action(ID.SUCCESS, {response}),
  failure: (error) => action(ID.FAILURE, {error})
}
