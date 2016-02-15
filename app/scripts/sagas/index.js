import {
  take,
  put,
  call,
  fork,
  race
} from 'redux-saga/effects'

import {history, api} from '../services'
import * as actions from '../actions'

const {id, logs, peerIds, peerDetails} = actions

// ---------- Subroutines

export function * fetchId () {
  yield put(id.request())

  try {
    const response = yield call(api.id)
    yield put(id.success(response))
  } catch (err) {
    yield put(id.failure(err.message))
  }
}

export function * loadId () {
  yield call(fetchId)
}

export function * fetchPeerDetails (ids) {
  yield put(peerDetails.request())

  try {
    const details = yield call(api.peerDetails, ids)
    yield put(peerDetails.success(details))
  } catch (err) {
    yield put(peerDetails.failure(err.message))
  }
}

export function * fetchPeerIds () {
  yield put(peerIds.request())

  try {
    const ids = yield call(api.peerIds)
    yield put(peerIds.success(ids))
    yield call(fetchPeerDetails, ids)
  } catch (err) {
    yield put(peerIds.failure(err.message))
  }
}

export function * watchLogs ({getNext}) {
  let cancel
  let data

  while (!cancel) {
    ({data, cancel} = yield race({
      data: call(getNext),
      cancel: take(actions.LEAVE_LOGS_PAGE)
    }))

    if (data) {
      yield put(logs.receive(data))
    }
  }

  yield put(logs.cancel())
}

// ---------- Watchers

export function * watchNavigate () {
  while (true) {
    const {pathname} = yield take(actions.NAVIGATE)
    yield history.push(pathname)
  }
}

export function * watchLoadHomePage () {
  while (true) {
    yield take(actions.LOAD_HOME_PAGE)

    yield fork(loadId)
  }
}

export function * watchLoadLogsPage () {
  while (yield take(actions.LOAD_LOGS_PAGE)) {
    const source = yield call(api.createLogSource)
    yield fork(watchLogs, source)
  }
}

export function * watchLoadPeersPage () {
  while (yield take(actions.LOAD_PEERS_PAGE)) {
    yield fork(fetchPeerIds)
  }
}

export function * watchLoadPages () {
  yield fork(watchLoadHomePage)
  yield fork(watchLoadLogsPage)
  yield fork(watchLoadPeersPage)
}

export default function * root (getState) {
  yield fork(watchNavigate)
  yield fork(watchLoadPages)
}
