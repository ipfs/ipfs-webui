import {
  take,
  put,
  call,
  fork,
  race,
  select
} from 'redux-saga/effects'
import { takeLatest } from 'redux-saga'

import {reduce, find} from 'lodash-es'
import {join} from 'path'

import {history, api} from '../services'
import * as actions from '../actions'
import {delay} from '../utils/promise'

const {
  home: {id},
  logs: {logs},
  peers: {
    peerIds,
    peerDetails,
    peerLocations,
    peers
  },
  files: {
    filesList,
    filesMkdir,
    filesRmDir,
    filesRmTmpDir,
    filesDeselectAll
  },
  config: {config},
  errors
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

export function * loadConfig () {
  try {
    const ipfsConfig = yield call(api.getConfig)

    yield put(config.initializeConfig(ipfsConfig))
    yield fork(watchSaveConfig)
  } catch (err) {
    yield put(config.failure(err.message))
  }
}

export function * leaveConfig () {
  yield put(errors.resetErrorMessage())
  yield put(config.markSaved(false))
}

export function * saveConfigDraft (action) {
  yield put(config.saveDraft(action.config))
}

export function * saveConfig () {
  yield put(config.saving(true))
  const state = yield select()
  const configStr = state.config.draft

  try {
    yield call(api.saveConfig, configStr)

    yield put(config.save(JSON.parse(configStr)))
    yield put(config.markSaved(true))
  } catch (err) {
    yield put(config.failure(err.message))
  }

  yield put(config.saving(false))
}

export function * watchPeers () {
  let cancel
  yield call(fetchPeerIds)

  while (!cancel) {
    ({cancel} = yield race({
      delay: call(delay, 5000),
      cancel: take(actions.pages.PEERS.LEAVE)
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
      cancel: take(actions.pages.FILES.LEAVE)
    }))

    if (!cancel) {
      yield call(fetchFiles)
    }
  }

  yield put(actions.files.files.cancel())
}

export function * watchFilesRoot () {
  while (yield take(actions.files.FILES.SET_ROOT)) {
    yield fork(fetchFiles)
  }
}

export function * watchCreateDir () {
  filesMkdir.request()

  while (yield take(actions.files.FILES.CREATE_DIR)) {
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

export function * watchRmDir () {
  filesRmDir.request()

  while (yield take(actions.files.FILES.REMOVE_DIR)) {
    try {
      const {files} = yield select()

      for (let file of files.selected) {
        yield call(api.files.rmdir, file)
      }

      yield fork(fetchFiles)
      yield put(filesRmDir.success())
      yield put(filesDeselectAll())
    } catch (err) {
      yield put(filesRmDir.failure(err.message))
    }
  }
}

export function * watchLogs ({getNext}) {
  let cancel
  let data

  while (!cancel) {
    ({data, cancel} = yield race({
      data: call(getNext),
      cancel: take(actions.pages.LOGS.LEAVE)
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
    const {pathname} = yield take(actions.router.NAVIGATE)
    yield history.push(pathname)
  }
}

export function * watchLoadHomePage () {
  while (true) {
    yield take(actions.pages.HOME.LOAD)

    yield fork(loadId)
  }
}

export function * watchLoadPeersPage () {
  while (yield take(actions.pages.PEERS.LOAD)) {
    yield fork(watchPeers)
  }
}

export function * watchLoadFilesPage () {
  while (yield take(actions.pages.FILES.LOAD)) {
    yield fork(watchFiles)
    yield fork(watchFilesRoot)
    yield fork(watchCreateDir)
    yield fork(watchRmDir)
  }
}

export function * watchLoadLogsPage () {
  while (yield take(actions.pages.LOGS.LOAD)) {
    const source = yield call(api.createLogSource)
    yield fork(watchLogs, source)
  }
}

export function * watchLoadConfigPage () {
  yield * takeLatest(actions.pages.CONFIG.LOAD, loadConfig)
}

export function * watchLeaveConfigPage () {
  yield * takeLatest(actions.pages.CONFIG.LEAVE, leaveConfig)
}

export function * watchLoadPages () {
  yield fork(watchLoadHomePage)
  yield fork(watchLoadPeersPage)
  yield fork(watchLoadFilesPage)
  yield fork(watchLoadLogsPage)
  yield fork(watchLoadConfigPage)
}

export function * watchLeavePages () {
  yield fork(watchLeaveConfigPage)
}

export function * watchSaveConfig () {
  yield * takeLatest(actions.config.CONFIG.SAVE_CONFIG_CLICK, saveConfig)
}

export default function * root () {
  yield fork(watchNavigate)
  yield fork(watchLoadPages)
  yield fork(watchLeavePages)
}
