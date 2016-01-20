import React from 'react'
import {render} from 'react-dom'
import Router, {hashHistory} from 'react-router'
import routes from './routes'

require('../styles/app.less')

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = true
}

document.addEventListener('DOMContentLoaded', () => {
  return render(
    <Router
        history={hashHistory}
        routes={routes} />,
    document.getElementById('root')
  )
})
