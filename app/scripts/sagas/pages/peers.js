import {put, call, select, fork, race, take} from 'redux-saga/effects'
import {reduce} from 'lodash-es'

import {peers, pages} from '../../actions'
import {api} from '../../services'
import {delay} from '../../utils/promise'

function missingLocations (ids, state) {
  if (!state.peers.locations) return ids

  const locations = state.peers.locations
  return ids.filter((id) => !locations[id])
}

export function * fetchPeerLocations (ids, details) {
  yield put(peers.peerLocations.request())

  try {
    const newLocations = yield call(api.peerLocations, ids, details)
    const state = yield select()

    const locations = reduce({
      ...state.peers.locations,
      ...newLocations
    }, (acc, location) => {
      const id = location.id
      if (state.peers.ids.find((i) => i === id)) {
        acc[id] = location
      }
      return acc
    }, {})

    yield put(peers.peerLocations.success(locations))
  } catch (err) {
    yield put(peers.peerLocations.failure(err.message))
  }
}

export function * fetchPeerIds () {
  yield put(peers.peerIds.request())

  try {
    const details = yield call(api.peerIds)
    const ids = Object.keys(details)

    yield put(peers.peerIds.success(ids))
    yield put(peers.peerDetails.success(details))

    const state = yield select()

    yield fork(fetchPeerLocations, missingLocations(ids, state), details)
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
