import {createStore, applyMiddleware} from 'redux'
import {hashHistory} from 'react-router'
import {routerMiddlware} from 'react-router-redux'
import saga from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

const finalCreateStore = applyMiddleware(
  saga(rootSaga),
  routerMiddlware(hashHistory)
)(createStore)

export default function configureStore (initialState) {
  return finalCreateStore(rootReducer, initialState)
}
