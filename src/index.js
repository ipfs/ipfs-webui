import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { Provider } from 'redux-bundler-react'
import './index.css'
import 'react-virtualized/styles.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import getStore from './bundles'

ReactDOM.render(
  <Provider store={getStore()}>
    <IntlProvider locale='en'>
      <App />
    </IntlProvider>
  </Provider>, document.getElementById('root'))

registerServiceWorker()
