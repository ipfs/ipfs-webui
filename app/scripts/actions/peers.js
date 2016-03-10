import {createRequestTypes, action} from './utils'

export const PEERS = {
  CANCEL: 'PEERS_CANCEL'
}

export const PEER_IDS = createRequestTypes('PEER_IDS')
export const PEER_DETAILS = createRequestTypes('PEER_DETAILS')
export const PEER_LOCATIONS = createRequestTypes('PEER_LOCATIONS')

export const peers = {
  cancel: () => action(PEERS.CANCEL)
}

export const peerIds = {
  request: () => action(PEER_IDS.REQUEST),
  success: (response) => action(PEER_IDS.SUCCESS, {response}),
  failure: (error) => action(PEER_IDS.FAILURE, {error})
}

export const peerDetails = {
  request: () => action(PEER_DETAILS.REQUEST),
  success: (response) => action(PEER_DETAILS.SUCCESS, {response}),
  failure: (error) => action(PEER_DETAILS.FAILURE, {error})
}

export const peerLocations = {
  request: () => action(PEER_LOCATIONS.REQUEST),
  success: (response) => action(PEER_LOCATIONS.SUCCESS, {response}),
  failure: (error) => action(PEER_LOCATIONS.FAILURE, {error})
}
