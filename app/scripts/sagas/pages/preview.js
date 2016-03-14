import {put, call, select, fork} from 'redux-saga/effects'

import {preview} from '../../actions'
import {api} from '../../services'

export function * stat () {
  try {
    yield put(preview.requests.stat.request())

    const {routing} = yield select()
    const {name} = routing.locationBeforeTransitions.query
    const stats = yield call(api.files.stat, name)

    yield put(preview.requests.stat.success({
      name,
      stats
    }))
  } catch (err) {
    yield put(preview.requests.stat.failure(err.message))
  }
}
export function * load () {
  yield fork(stat)
  // TODO READ FILE
}

export function * leave () {
  yield put(preview.clear())
}
