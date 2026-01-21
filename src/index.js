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
import { HeliaProvider, ExploreProvider } from 'ipld-explorer-components/providers'

import { ShortcutsProvider } from './contexts/ShortcutsContext.js'
import { ContextBridgeProvider } from './helpers/context-bridge.jsx'

const appVersion = process.env.REACT_APP_VERSION
const gitRevision = process.env.REACT_APP_GIT_REV

console.log(`IPFS Web UI - v${appVersion} - https://github.com/ipfs-shipyard/ipfs-webui/commit/${gitRevision}`)

async function render () {
  const initialData = await bundleCache.getAll()
  if (initialData && process.env.NODE_ENV !== 'production') {
    console.log('intialising store with data from cache', initialData)
  }
  console.log(
    '%cStop!',
    'color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 black;'
  )
  console.log(
    '%cThis is a browser feature intended for developers. If someone told you to paste something here, they might be trying to steal your data!',
    'color: black; font-size: 16px; font-weight: bold; background: yellow; padding: 4px; border-radius: 4px;'
  )
  const store = getStore(initialData)
  ReactDOM.render(
    <Provider store={store}>

      <ContextBridgeProvider>
        <I18nextProvider i18n={i18n} >
          <DndProvider backend={DndBackend}>
            <HeliaProvider>
            <ShortcutsProvider>
              <ExploreProvider>
                  <App />
                </ExploreProvider>
              </ShortcutsProvider>
            </HeliaProvider>
          </DndProvider>
        </I18nextProvider>
      </ContextBridgeProvider>

    </Provider>,
    document.getElementById('root')
  )
}

render()
