import {createStore, applyMiddleware, compose} from 'redux'
import {browserHistory} from 'react-router'
import {routerMiddleware} from 'react-router-redux'
import createLogger from 'redux-logger'
import saga from 'redux-saga'

import rootReducer from '../reducers'
import rootSaga from '../sagas'

const finalCreateStore = compose(
  applyMiddleware(saga(rootSaga), routerMiddleware(browserHistory), createLogger()),
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
