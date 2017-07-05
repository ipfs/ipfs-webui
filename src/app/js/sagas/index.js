import {fork} from 'redux-saga/effects'

import watchPages from './pages'

export default function * root () {
  yield fork(watchPages)
}
