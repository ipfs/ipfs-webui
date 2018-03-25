import {createStore, applyMiddleware} from 'redux'
import {hashHistory} from 'react-router'
import {routerMiddleware} from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

export default function configureStore (initialState) {
  const sagaMiddleware = createSagaMiddleware()

  const finalCreateStore = applyMiddleware(
    sagaMiddleware,
    routerMiddleware(hashHistory)
  )(createStore)

  const store = finalCreateStore(rootReducer, initialState)

  sagaMiddleware.run(rootSaga)

  return store
}
