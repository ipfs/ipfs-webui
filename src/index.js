import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'redux-bundler-react'
import './index.css'
import 'react-virtualized/styles.css'
import App from './App.js'
import getStore from './bundles/index.js'
import bundleCache from './lib/bundle-cache.js'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n.js'
import { DndProvider } from 'react-dnd'
import DndBackend from './lib/dnd-backend.js'

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
          <App />
        </DndProvider>
      </I18nextProvider>
    </Provider>,
    document.getElementById('root')
  )
}

render()
