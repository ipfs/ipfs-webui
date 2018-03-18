import {put, call, fork, take} from 'redux-saga/effects'

import {preview} from '../../actions'
import {api} from '../../services'
import {loadConfig} from '../config'

export function * stat (name) {
  try {
    yield put(preview.requests.stat.request())
    const stats = yield call(api.files.stat, name)

    yield put(preview.requests.stat.success({
      name,
      stats
    }))
  } catch (err) {
    yield put(preview.requests.stat.failure(err.message))
  }
}

export function * read (name) {
  try {
    yield put(preview.requests.read.request())

    const content = yield call(api.files.read, name)

    yield put(preview.requests.read.success(content))
  } catch (err) {
    yield put(preview.requests.read.failure(err.message))
  }
}

export function * watchStat () {
  const {name} = yield take(preview.PREVIEW.STAT)

  yield fork(stat, name)
}

export function * watchRead () {
  const {name} = yield take(preview.PREVIEW.READ)

  yield fork(read, name)
}

export function * load () {
  yield fork(loadConfig)
  yield fork(watchStat)
  yield fork(watchRead)
}

export function * leave () {
  yield put(preview.clear())
}
