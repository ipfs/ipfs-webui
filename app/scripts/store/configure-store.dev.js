import {createStore, applyMiddleware, compose} from 'redux'
import createLogger from 'redux-logger'
import saga from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

const finalCreateStore = compose(
  applyMiddleware(saga(rootSaga), createLogger()),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)(createStore)

export default function configureStore (initialState) {
  const store = finalCreateStore(rootReducer, initialState)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
