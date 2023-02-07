import React from 'react'
import { action } from '@storybook/addon-actions'

import Toast from './Toast.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Toast'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => (
  <div style={{ height: '100vh' }}>
    <Toast onDismiss={action('cancel')}>
      <b>Hurray!</b> New things are available.
    </Toast>
  </div>
)

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Error = () => (
  <div style={{ height: '100vh' }}>
    <Toast onDismiss={action('cancel')} error>
            Oh no! Something dreadful has occured.
    </Toast>
  </div>
)
