import {createStore, applyMiddleware, compose} from 'redux'
import {routerMiddleware} from 'react-router-redux'
import {createLogger} from 'redux-logger'
import createSagaMiddleware from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

export default function configureStore (history) {
  const sagaMiddleware = createSagaMiddleware()

  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware, routerMiddleware(history), createLogger()),
    window.devToolsExtension ? window.devToolsExtension() : (f) => f
  )(createStore)

  const store = finalCreateStore(rootReducer)

  sagaMiddleware.run(rootSaga)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
