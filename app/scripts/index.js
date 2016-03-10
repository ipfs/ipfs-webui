import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import {browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'

import routes from './routes'
import Root from './containers/root'
import configureStore from './store/configure-store'
import '../styles/app.less'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

requestAnimationFrame(() => {
  render(
    <Root
      store={store}
      history={history}
      routes={routes}
    />,
    document.getElementById('root')
  )
})
