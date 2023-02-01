import React from 'react'
import { action } from '@storybook/addon-actions'
import Radio from './Radio.js'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Radio',
  component: Radio
}

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Default = () => (
    <div>
        <Radio className="ma2" label="Click me!" onChange={action('Checked')} />
    </div>
)

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Disabled = () => (
    <div>
        <Radio label="Click me!" className="ma2" disabled onChange={action('Checked')} />
    </div>
)

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Big = () => (
    <div>
        <Radio style={bigPicture} label="Click me!" className="ma2" onChange={action('Checked')} />
    </div>
)
