import {take, put, call, fork} from 'redux-saga'

import {history, api} from '../services'
import * as actions from '../actions'

const {id} = actions

// ---------- Subroutines

function * fetchId () {
  console.log('api', api)
  yield put(id.request())
  const {response, error} = yield call(api.fetchId)

  if (response) {
    yield put(id.success(response))
  } else {
    yield put(id.failure(error))
  }
}

function * loadId () {
  yield call(fetchId)
}

// ---------- Watchers

function * watchNavigate () {
  while (true) {
    const {pathname} = yield take(actions.NAVIGATE)
    yield history.push(pathname)
  }
}

function * watchLoadHomePage () {
  while (true) {
    yield take(actions.LOAD_HOME_PAGE)

    yield fork(loadId)
  }
}

export default function * root (getState) {
  yield fork(watchNavigate)
  yield fork(watchLoadHomePage)
}
