import {combineReducers} from 'redux'
import {reducer as toastr} from 'react-redux-toastr'
import {routerReducer} from 'react-router-redux'

import id from './id'
import peers from './peers'
import files from './files'
import preview from './preview'
import config from './config'
import logs from './logs'
import errors from './errors'

const rootReducer = combineReducers({
  id,
  peers,
  files,
  preview,
  logs,
  errors,
  config,
  toastr,
  routing: routerReducer
})

export default rootReducer
