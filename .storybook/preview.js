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
import { ThemeProvider } from '../src/context/theme-provider.tsx'

/**
 * @type {import('@storybook/addons').BaseAnnotations}
 */
const baseAnnotations = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Provider store={getStore(undefined)}>
          <I18nextProvider i18n={i18n} >
            <DndProvider backend={DndBackend}>
              <HeliaProvider>
                <ExploreProvider>
                  <Story />
                </ExploreProvider>
              </HeliaProvider>
            </DndProvider>
          </I18nextProvider>
        </Provider>
      </ThemeProvider>
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
