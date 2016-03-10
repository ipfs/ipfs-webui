import {combineReducers} from 'redux'
import {reducer as toastr} from 'react-redux-toastr'
import {routerReducer} from 'react-router-redux'

import id from './id'
import peers from './peers'
import files from './files'
import config from './config'
import logs from './logs'
import errors from './errors'

const rootReducer = combineReducers({
  id,
  peers,
  files,
  logs,
  errors,
  config,
  toastr,
  routing: routerReducer
})

export default rootReducer
