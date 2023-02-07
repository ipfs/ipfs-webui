// import React from '@storybook/react'
import { withKnobs, text, number, color } from '@storybook/addon-knobs'

const requireContext = require.context('.', true, /\.js?$/)
const modules = requireContext.keys().filter((c) => !c.includes('.stories') && !c.includes('index.js'))
const icons = modules.map((m) => ({
  name: m.replace('./', '').replace('.js', ''),
  Icon: requireContext(m).default
}))

const filterByTextQuery = (icon) => {
  const searchQuery = text('Search', '')
  return icon.name.includes(searchQuery)
}

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Icons',
  component: List,
  // decorators: [withKnobs],
  argTypes: {
    iconFilter: {
      control: { type: 'text' }
    },
    size: {
      control: {
        type: 'range',
        min: 1,
        max: 200,
        step: 1
      }
    },
    fill: {
      control: {
        type: 'color'
      }
    },
    stroke: {
      control: {
        type: 'color'
      }
    }
  }
}
/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  name: 'Icons',
  args: {
    iconFilter: '',
    size: 32,
    fill: undefined,
    stroke: undefined
  }
}
