import {combineReducers} from 'redux'

import id from './id'
import peers from './peers'
import files from './files'
import logs from './logs'
import errors from './errors'
import router from './router'

const rootReducer = combineReducers({
  id,
  peers,
  files,
  logs,
  errors,
  router
})

export default rootReducer
