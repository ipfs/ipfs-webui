import React from 'react'
import {Route, IndexRoute, Redirect} from 'react-router'

import App from './containers/app'
import HomePage from './containers/home'
import LogPage from './containers/logs'
import PeersPage from './containers/peers'
import FilesPage from './containers/files'
import FilesPreviewPage from './containers/files-preview'
import ConfigPage from './containers/config'
import NotFoundPage from './components/notfound'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={HomePage} />
    <Route path='home' component={HomePage} />

    <Route path='peers' component={PeersPage} />
    <Route path='files' component={FilesPage}>
      <Route path='preview' component={FilesPreviewPage} />
    </Route>

    <Route path='config' component={ConfigPage} />
    <Route path='logs' component={LogPage} />

    <Route path='*' component={NotFoundPage} />
    <Redirect from='/index.html' to='/home' />
  </Route>
)
