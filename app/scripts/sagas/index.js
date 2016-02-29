import {
  take,
  put,
  call,
  fork,
  race,
  select
} from 'redux-saga/effects'
import {reduce, find} from 'lodash'
import {join} from 'path'

import {history, api} from '../services'
import * as actions from '../actions'
import {delay} from '../utils/promise'

const {
  id,
  logs,
  peerIds,
  peerDetails,
  peerLocations,
  peers,
  filesList,
  filesMkdir,
  filesRmTmpDir
} = actions

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

export function * fetchPeerLocations (ids) {
  yield put(peerLocations.request())

  try {
    const newLocations = yield call(api.peerLocations, ids)
    const {peers} = yield select()

    const locations = reduce({
      ...peers.locations,
      ...newLocations
    }, (acc, location) => {
      const id = location.id
      if (find(peers.ids, {id})) {
        acc[id] = location
      }
      return acc
    }, {})

    yield put(peerLocations.success(locations))
  } catch (err) {
    yield put(peerLocations.failure(err.message))
  }
}

export function * fetchPeerDetails (ids) {
  yield put(peerDetails.request())

  try {
    const newDetails = yield call(api.peerDetails, ids)
    const {peers} = yield select()

    const details = reduce({
      ...peers.details,
      ...newDetails
    }, (acc, detail) => {
      const id = detail.id
      if (find(peers.ids, {id})) {
        acc[id] = detail
      }
      return acc
    }, {})

    yield put(peerDetails.success(details))
  } catch (err) {
    yield put(peerDetails.failure(err.message))
  }
}

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

export function * fetchPeerIds () {
  yield put(peerIds.request())

  try {
    const ids = yield call(api.peerIds)
    yield put(peerIds.success(ids))

    const state = yield select()

    yield fork(fetchPeerDetails, missingDetails(ids, state))
    yield fork(fetchPeerLocations, missingLocations(ids, state))
  } catch (err) {
    yield put(peerIds.failure(err.message))
  }
}

export function * watchPeers () {
  let cancel
  yield call(fetchPeerIds)

  while (!cancel) {
    ({cancel} = yield race({
      delay: call(delay, 5000),
      cancel: take(actions.LEAVE_PEERS_PAGE)
    }))

    if (!cancel) {
      yield call(fetchPeerIds)
    }
  }

  yield put(peers.cancel())
}

export function * fetchFiles () {
  yield put(filesList.request())

  try {
    const {files} = yield select()
    const res = yield call(api.files.list, files.root)
    yield put(filesList.success(res))
  } catch (err) {
    yield put(filesList.failure(err.message))
  }
}

export function * watchFiles () {
  let cancel
  yield call(fetchFiles)

  while (!cancel) {
    ({cancel} = yield race({
      delay: call(delay, 10000),
      cancel: take(actions.LEAVE_FILES_PAGE)
    }))

    if (!cancel) {
      yield call(fetchFiles)
    }
  }

  yield put(actions.files.cancel())
}

export function * watchFilesRoot () {
  while (yield take(actions.FILES.SET_ROOT)) {
    yield fork(fetchFiles)
  }
}

export function * watchCreateDir () {
  filesMkdir.request()

  while (yield take(actions.FILES.CREATE_DIR)) {
    try {
      const {files} = yield select()
      const name = join(files.tmpDir.root, files.tmpDir.name)
      yield call(api.files.mkdir, name)

      yield fork(fetchFiles)
      yield put(filesMkdir.success())
      yield put(filesRmTmpDir())
    } catch (err) {
      yield put(filesMkdir.failure(err.message))
    }
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

export function * watchLoadPeersPage () {
  while (yield take(actions.LOAD_PEERS_PAGE)) {
    yield fork(watchPeers)
  }
}

export function * watchLoadFilesPage () {
  while (yield take(actions.LOAD_FILES_PAGE)) {
    yield fork(watchFiles)
    yield fork(watchFilesRoot)
    yield fork(watchCreateDir)
  }
}

export function * watchLoadLogsPage () {
  while (yield take(actions.LOAD_LOGS_PAGE)) {
    const source = yield call(api.createLogSource)
    yield fork(watchLogs, source)
  }
}

export function * watchLoadPages () {
  yield fork(watchLoadHomePage)
  yield fork(watchLoadPeersPage)
  yield fork(watchLoadFilesPage)
  yield fork(watchLoadLogsPage)
}

export default function * root () {
  yield fork(watchNavigate)
  yield fork(watchLoadPages)
}
