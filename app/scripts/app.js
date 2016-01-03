import React from 'react'
import {render} from 'react-dom'
import Router, {hashHistory} from 'react-router'

import routes from './routes'

require('../styles/app.less')

if (process.env.NODE_ENV !== 'production') {
  window.uiDebug = require('debug')
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')

  render(<Router history={hashHistory} routes={routes} />, root)
})
