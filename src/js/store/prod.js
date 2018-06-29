import {createStore, applyMiddleware} from 'redux'
import {routerMiddleware} from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

export default function configureStore (history) {
  const sagaMiddleware = createSagaMiddleware()

  const finalCreateStore = applyMiddleware(
    sagaMiddleware,
    routerMiddleware(history)
  )(createStore)

  const store = finalCreateStore(rootReducer)

  sagaMiddleware.run(rootSaga)

  return store
}
