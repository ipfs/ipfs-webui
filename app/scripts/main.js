import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router'
import routes from './routes'

// import linkHandler from './linkhandler.js'
if (process.env.NODE_ENV !== 'production') {
  window.uiDebug = require('debug')
}

document.addEventListener('DOMContentLoaded', function () {
  Router.run(routes, function (Handler) {
    ReactDOM.render(<Handler />, document.getElementById('root'))
  })
})
