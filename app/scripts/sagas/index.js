import {
  take,
  put,
  call,
  fork,
  race
} from 'redux-saga'

import {history, api} from '../services'
import * as actions from '../actions'

const {id, logs} = actions

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

export default function * root (getState) {
  yield fork(watchNavigate)
  yield fork(watchLoadHomePage)
  yield fork(watchLoadLogsPage)
}
