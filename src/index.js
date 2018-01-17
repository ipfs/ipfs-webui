import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Api from 'ipfs-api'
import { HashRouter } from 'react-router-dom'

import '../node_modules/normalize.css/normalize.css'
import './styles/app.css'

let host = window.location.hostname
let port = 5001

const api = new Api(host, port)

ReactDOM.render((
  <HashRouter>
    <App api={api} />
  </HashRouter>
), document.getElementById('root'))
