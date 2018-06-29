import React from 'react'
import {render} from 'react-dom'
import createHistory from 'history/createHashHistory'

import Root from './root'
import configureStore from './store'

import '../css/app.less'

const history = createHistory()
const store = configureStore(history)

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Root store={store} history={history} />,
    document.getElementById('root')
  )
})
