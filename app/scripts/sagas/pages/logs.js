import {call, fork, race, put, take} from 'redux-saga/effects'

import * as actions from '../../actions'
import {api} from '../../services'

const {
  logs: {logs},
  pages
} = actions

export function * watchLogs ({getNext}) {
  let cancel
  let data

  while (!cancel) {
    ({data, cancel} = yield race({
      data: call(getNext),
      cancel: take(pages.LOGS.LEAVE)
    }))

    if (data) {
      yield put(logs.receive(data))
    }
  }

  yield put(logs.cancel())
}

export function * load () {
  const source = yield call(api.createLogSource)
  yield fork(watchLogs, source)
}
