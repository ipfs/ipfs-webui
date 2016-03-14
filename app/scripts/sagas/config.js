import {call, put} from 'redux-saga/effects'

import {api} from '../services'
import * as actions from '../actions'

const {
  config: {config}
} = actions

export function * loadConfig () {
  try {
    yield put(config.load.request())

    const ipfsConfig = yield call(api.getConfig)

    yield put(config.load.success(ipfsConfig))
  } catch (err) {
    yield put(config.load.failure(err.message))
  }
}
