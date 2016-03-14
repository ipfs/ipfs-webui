import {createRequestTypes, action} from './utils'

export const requests = {
  PREVIEW_STAT: createRequestTypes('PREVIEW_STAT'),
  PREVIEW_READ: createRequestTypes('PREVIEW_READ'),
  stat: {
    request: () => action(requests.PREVIEW_STAT.REQUEST),
    success: (response) => action(requests.PREVIEW_STAT.SUCCESS, {response}),
    failure: (error) => action(requests.PREVIEW_STAT.FAILURE, {error})
  },
  read: {
    request: () => action(requests.PREVIEW_READ.REQUEST),
    success: (response) => action(requests.PREVIEW_READ.SUCCESS, {response}),
    failure: (error) => action(requests.PREVIEW_READ.FAILURE, {error})
  }
}

export const PREVIEW = {
  STAT: 'PREVIEW.STAT',
  READ: 'PREVIEW.READ',
  CLEAR: 'PREVIEW.CLEAR'
}

export const stat = (name) => action(PREVIEW.STAT, {name})
export const read = (name) => action(PREVIEW.READ, {name})
export const clear = () => action(PREVIEW.CLEAR)
