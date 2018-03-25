import React from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {ConnectedRouter} from 'react-router-redux'
import {Route, Switch, Redirect} from 'react-router'

import App from './containers/app'
import Files from './containers/files'
import NotFoundPage from './components/not-found'

/* Legacy pages */
import HomePage from './pages/home'
import ConnectionsPage from './pages/connections'
import ObjectsPage from './pages/objects'
import BitswapPage from './pages/bitswap'
import RoutingPage from './pages/routing'
import ConfigPage from './pages/config'
import LogPage from './pages/logs'

export default function Root (props) {
  const {store, history} = props

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App>
          <Switch>
            <Redirect exact from='/' to='/home' />
            <Redirect exact from='/index.html' to='/home' />
            <Route exact path='/home' component={HomePage} />
            <Route path='/connections' component={ConnectionsPage} />
            <Route path='/files' component={Files} />
            <Route path='/objects/(.*)?' component={ObjectsPage} />
            <Route path='/bitswap' component={BitswapPage} />
            <Route path='/routing' component={RoutingPage} />
            <Route path='/config' component={ConfigPage} />
            <Route path='/logs' component={LogPage} />
            <Route path='*' component={NotFoundPage} />
          </Switch>
        </App>
      </ConnectedRouter>
    </Provider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}
