import {put, call} from 'redux-saga/effects'
import {home} from '../../actions'
import {api} from '../../services'

export function * fetchId () {
  yield put(home.id.request())

  try {
    const response = yield call(api.id)
    yield put(home.id.success(response))
    yield call(fetchLocation, response.addresses)
  } catch (err) {
    yield put(home.id.failure(err.message))
  }
}

export function * fetchLocation (addresses) {
  yield put(home.location.request())

  try {
    const response = yield call(api.getLocation, addresses)
    yield put(home.id.success(response))
  } catch (err) {
    // TODO: should simply ignore error and send location unknown?
    yield put(home.location.failure(err.message))
  }
}

export function * load () {
  yield call(fetchId)
}
