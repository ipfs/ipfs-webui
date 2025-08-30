import React from 'react'
import { Provider } from 'redux-bundler-react'
import { I18nextProvider } from 'react-i18next'
import { DndProvider } from 'react-dnd'
import 'react-virtualized/styles.css'
import '../src/index.css'

import getStore from '../src/bundles/index.js'
import i18n from '../src/i18n.js'
import DndBackend from '../src/lib/dnd-backend.js'
import { HeliaProvider, ExploreProvider } from 'ipld-explorer-components/providers'
import { ContextBridgeProvider } from '../src/helpers/context-bridge'

/**
 * @type {import('@storybook/addons').BaseAnnotations}
 */
const baseAnnotations = {
  decorators: [
    (Story) => (
      <Provider store={getStore({ ipfs: { apiAddress: null, provider: null, failed: false, ready: false, invalidAddress: false, pendingFirstConnection: false } })}>
        <ContextBridgeProvider>
          <I18nextProvider i18n={i18n} >
            <DndProvider backend={DndBackend}>
              <HeliaProvider>
                <ExploreProvider>
                  <Story />
                </ExploreProvider>
              </HeliaProvider>
            </DndProvider>
          </I18nextProvider>
        </ContextBridgeProvider>
      </Provider>
    )
  ],
  /**
   * @see https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
   */
  argTypes: {
    onChange: {
      action: 'changed'
    },
    onClick: {
      action: 'clicked'
    }
  }
}

export const decorators = baseAnnotations.decorators
export const argTypes = baseAnnotations.argTypes
