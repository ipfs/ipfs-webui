import {createStore, applyMiddleware} from 'redux'
import {browserHistory} from 'react-router'
import {routerMiddlware} from 'react-router-redux'
import saga from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

const finalCreateStore = applyMiddleware(
  saga(rootSaga),
  routerMiddlware(browserHistory)
)(createStore)

export default function configureStore (initialState) {
  return finalCreateStore(rootReducer, initialState)
}
