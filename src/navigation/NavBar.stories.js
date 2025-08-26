import React from 'react'

import { withKnobs } from '@storybook/addon-knobs'
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
export const Default = {
  render: () => (
  <div className="sans-serif vh-100 bg-navy" style={{ width: 156 }}>
    <NavBar
      t={i18n.getFixedT('en', 'status')}
    />
  </div>
  )
}
