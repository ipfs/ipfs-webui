import React from 'react'
import { Provider } from 'redux-bundler-react'
import { I18nextProvider } from 'react-i18next'
import { DndProvider } from 'react-dnd'
import 'react-virtualized/styles.css'
import '../src/index.css'

import getStore from '../src/bundles/index.js'
import i18n from '../src/i18n.js'
import DndBackend from '../src/lib/dnd-backend.js'

/**
 * @type {import('@storybook/addons').BaseAnnotations}
 */
const baseAnnotations = {
  decorators: [
    (Story) => (
      <Provider store={getStore(undefined)}>
        <I18nextProvider i18n={i18n} >
          <DndProvider backend={DndBackend}>
            <Story />
          </DndProvider>
        </I18nextProvider>
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
