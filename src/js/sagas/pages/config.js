import {put, call, select, fork, take} from 'redux-saga/effects'
import {takeLatest} from 'redux-saga'

import * as actions from '../../actions'
import {api} from '../../services'
import {loadConfig} from '../config'

const {
  config: {config, CONFIG},
  errors
} = actions

export function * saveConfigDraft (action) {
  yield put(config.saveDraft(action.config))
}

export function * saveConfig () {
  yield put(config.saving(true))
  const state = yield select()
  const configStr = JSON.parse(state.config.draft)

  try {
    yield call(api.saveConfig, configStr)

    yield put(config.save(configStr))
    yield put(config.markSaved(true))
  } catch (err) {
    yield put(config.failure(err.message))
  }

  yield put(config.saving(false))
}

export function * watchSaveConfig () {
  yield * takeLatest(CONFIG.SAVE_CONFIG_CLICK, saveConfig)
}

export function * initConfig () {
  const {response} = yield take(CONFIG.LOAD.SUCCESS)
  yield put(config.initializeConfig(response))
}

export function * load () {
  yield fork(initConfig)
  yield fork(loadConfig)
  yield fork(watchSaveConfig)
}

export function * leave () {
  yield put(errors.resetErrorMessage())
  yield put(config.markSaved(false))
}
