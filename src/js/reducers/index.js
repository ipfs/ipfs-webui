import {combineReducers} from 'redux'
import {reducer as toastr} from 'react-redux-toastr'
import {routerReducer} from 'react-router-redux'

import home from './home'
import files from './files'
import preview from './preview'
import config from './config'
import errors from './errors'

const rootReducer = combineReducers({
  home,
  files,
  preview,
  errors,
  config,
  toastr,
  routing: routerReducer
})

export default rootReducer
