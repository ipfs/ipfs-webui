import React from 'react'
import ComponentLoader from './ComponentLoader.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'ComponentLoader'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => (
  <div className="flex items-center">
    <ComponentLoader style={{ width: 100, margin: '100px auto' }} />
    <ComponentLoader style={{ width: 200, margin: '100px auto' }} />
    <ComponentLoader style={{ width: 300, margin: '100px auto' }} />
  </div>
)
