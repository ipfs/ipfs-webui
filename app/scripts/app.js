import React from 'react'
import { render } from 'react-dom'
import Router from 'react-router'
import routes from './routes'

require('../styles/app.less')

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = true
}

document.addEventListener('DOMContentLoaded', () => render(<Router history={Router.hashHistory} routes={routes} />, document.getElementById('root')))
