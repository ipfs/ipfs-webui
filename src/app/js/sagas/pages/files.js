import {put, call, select, fork, take, race} from 'redux-saga/effects'
import {join} from 'path'

import * as actions from '../../actions'
import {api} from '../../services'
import {delay} from '../../utils/promise'

const {
  files: filesActions,
  pages
} = actions

export function * fetchFiles () {
  yield put(filesActions.filesList.request())

  try {
    const {files} = yield select()
    const res = yield call(api.files.list, files.root)
    yield put(filesActions.filesList.success(res))
  } catch (err) {
    yield put(filesActions.filesList.failure(err.message))
  }
}

export function * watchFiles () {
  let cancel
  yield call(fetchFiles)

  while (!cancel) {
    ({cancel} = yield race({
      delay: call(delay, 10000),
      cancel: take(pages.FILES.LEAVE)
    }))

    if (!cancel) {
      yield call(fetchFiles)
    }
  }

  yield put(filesActions.files.cancel())
}

export function * watchFilesRoot () {
  while (yield take(filesActions.FILES.SET_ROOT)) {
    yield fork(fetchFiles)
  }
}

export function * watchCreateDir () {
  while (yield take(filesActions.FILES.CREATE_DIR)) {
    try {
      yield put(filesActions.filesMkdir.request())
      const {files} = yield select()
      const name = join(files.tmpDir.root, files.tmpDir.name)
      yield call(api.files.mkdir, name)

      yield fork(fetchFiles)
      yield put(filesActions.filesMkdir.success())
      yield put(filesActions.filesRmTmpDir())
    } catch (err) {
      yield put(filesActions.filesMkdir.failure(err.message))
    }
  }
}

export function * watchCreateFiles () {
  while (true) {
    try {
      const {root, files} = yield take(filesActions.FILES.CREATE_FILES)
      yield put(filesActions.createFiles.request())
      yield call(api.files.createFiles, root, files)

      yield fork(fetchFiles)
      yield put(filesActions.createFiles.success())
    } catch (err) {
      yield put(filesActions.createFiles.failure(err.message))
    }
  }
}

export function * watchRmDir () {
  while (yield take(filesActions.FILES.REMOVE_DIR)) {
    try {
      yield put(filesActions.filesRmDir.request())
      const {files} = yield select()

      for (let file of files.selected) {
        yield call(api.files.rmdir, file)
      }

      yield fork(fetchFiles)
      yield put(filesActions.filesRmDir.success())
      yield put(filesActions.filesDeselectAll())
    } catch (err) {
      yield put(filesActions.filesRmDir.failure(err.message))
    }
  }
}

export function * load () {
  yield fork(watchFiles)
  yield fork(watchFilesRoot)
  yield fork(watchCreateDir)
  yield fork(watchRmDir)
  yield fork(watchCreateFiles)
}
