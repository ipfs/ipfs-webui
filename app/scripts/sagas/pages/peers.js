import {put, call, select, fork, race, take} from 'redux-saga/effects'
import {reduce, find} from 'lodash-es'

import {peers, pages} from '../../actions'
import {api} from '../../services'
import {delay} from '../../utils/promise'

function missingDetails (ids, state) {
  if (!state.peers.details) return ids

  const details = state.peers.details
  return ids.filter(({id}) => {
    return !details[id]
  })
}

function missingLocations (ids, state) {
  if (!state.peers.locations) return ids

  const locations = state.peers.locations
  return ids.filter(({id}) => {
    return !locations[id]
  })
}

export function * fetchPeerLocations (ids) {
  yield put(peers.peerLocations.request())

  try {
    const newLocations = yield call(api.peerLocations, ids)
    const state = yield select()

    const locations = reduce({
      ...state.peers.locations,
      ...newLocations
    }, (acc, location) => {
      const id = location.id
      if (find(state.peers.ids, {id})) {
        acc[id] = location
      }
      return acc
    }, {})

    yield put(peers.peerLocations.success(locations))
  } catch (err) {
    yield put(peers.peerLocations.failure(err.message))
  }
}

export function * fetchPeerDetails (ids) {
  yield put(peers.peerDetails.request())

  try {
    const newDetails = yield call(api.peerDetails, ids)
    const state = yield select()

    const details = reduce({
      ...state.peers.details,
      ...newDetails
    }, (acc, detail) => {
      const id = detail.id
      if (find(state.peers.ids, {id})) {
        acc[id] = detail
      }
      return acc
    }, {})

    yield put(peers.peerDetails.success(details))
  } catch (err) {
    yield put(peers.peerDetails.failure(err.message))
  }
}

export function * fetchPeerIds () {
  yield put(peers.peerIds.request())

  try {
    const ids = yield call(api.peerIds)
    yield put(peers.peerIds.success(ids))

    const state = yield select()

    yield fork(fetchPeerDetails, missingDetails(ids, state))
    yield fork(fetchPeerLocations, missingLocations(ids, state))
  } catch (err) {
    yield put(peers.peerIds.failure(err.message))
  }
}

export function * watchPeers () {
  let cancel
  yield call(fetchPeerIds)

  while (!cancel) {
    ({cancel} = yield race({
      delay: call(delay, 5000),
      cancel: take(pages.PEERS.LEAVE)
    }))

    if (!cancel) {
      yield call(fetchPeerIds)
    }
  }

  yield put(peers.peers.cancel())
}

export function * load () {
  yield fork(watchPeers)
}
