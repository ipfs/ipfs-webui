import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'redux-bundler-react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './index.css'
import 'react-virtualized/styles.css'
import App from './App'
import getStore from './bundles'
import bundleCache from './lib/bundle-cache'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { DndProvider } from 'react-dnd'
import DndBackend from './lib/dnd-backend'

import greetz from './assets/images/greetz.png'
import splash from './assets/images/splash.jpg'

const appVersion = process.env.REACT_APP_VERSION
const gitRevision = process.env.REACT_APP_GIT_REV

console.log(`IPFS Web UI - v${appVersion} - https://github.com/ipfs-shipyard/ipfs-webui/commit/${gitRevision}`)

async function render () {
  const initialData = await bundleCache.getAll()
  if (initialData && process.env.NODE_ENV !== 'production') {
    console.log('intialising store with data from cache', initialData)
  }
  const store = getStore(initialData)
  ReactDOM.render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n} >
        <DndProvider backend={DndBackend}>
          <Router>
            <Switch>
              <Route exact path="/greetz">
                <div className='splash-wrapper' onClick={() => { window.close() }} aria-hidden="true">
                  <img className='splash-image' alt='GreetZ' src={greetz} />
                </div>
              </Route>
              <Route exact path='/splash'>
                <div className='splash-wrapper'>
                  <img className='splash-image' alt='Multiverse splash' src={splash} />
                </div>
              </Route>
              <Route path="/">
                <App />
              </Route>
            </Switch>
          </Router>
        </DndProvider>
      </I18nextProvider>
    </Provider>,
    document.getElementById('root')
  )
}

render()
