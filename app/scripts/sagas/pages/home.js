import {put, call} from 'redux-saga/effects'

import {home} from '../../actions'
import {api} from '../../services'

export function * fetchId () {
  yield put(home.id.request())

  try {
    const response = yield call(api.id)
    yield put(home.id.success(response))
  } catch (err) {
    yield put(home.id.failure(err.message))
  }
}

export function * load () {
  yield call(fetchId)
}
