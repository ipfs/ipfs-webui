import React from 'react'

import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18n from '../i18n.js'
import { NavBar } from './NavBar.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'NavBar',
  decorators: [withKnobs]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => (
  <div className="sans-serif vh-100 bg-navy" style={{ width: 156 }}>
    <NavBar
      className="w-100"
      isSettingsEnabled={boolean('isSettingsEnabled', true)}
      open={boolean('open', true)}
      onToggle={action('onToggle')}
      t={i18n.getFixedT('en', 'status')}
    />
  </div>
)
