import { Provider } from 'redux-bundler-react'
import { I18nextProvider } from 'react-i18next'
import { DndProvider } from 'react-dnd'
import 'react-virtualized/styles.css'
import '../src/index.css'

import getStore from '../src/bundles'
import i18n from '../src/i18n'
import DndBackend from '../src/lib/dnd-backend'

export const decorators = [
  (Story) => (
    <Provider store={getStore(undefined)}>
      <I18nextProvider i18n={i18n} >
        <DndProvider backend={DndBackend}>
          <Story />
        </DndProvider>
      </I18nextProvider>
    </Provider>
  )
];
