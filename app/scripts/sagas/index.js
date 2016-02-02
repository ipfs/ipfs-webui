import {take, put, call, fork} from 'redux-saga'

import {history, api} from '../services'
import * as actions from '../actions'

const {id} = actions

// ---------- Subroutines

export function * fetchId () {
  yield put(id.request())
  const {response, error} = yield call(api.fetchId)

  if (response) {
    yield put(id.success(response))
  } else {
    yield put(id.failure(error))
  }
}

export function * loadId () {
  yield call(fetchId)
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

export default function * root (getState) {
  yield fork(watchNavigate)
  yield fork(watchLoadHomePage)
}
