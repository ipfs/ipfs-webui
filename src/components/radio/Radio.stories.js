import React from 'react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import Radio from './Radio'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

export default {
  title: 'Radio',
  decorators: [checkA11y]
}

export const Default = () => (
    <div>
        <Radio className="ma2" label="Click me!" onChange={action('Checked')} />
    </div>
)

export const Disabled = () => (
    <div>
        <Radio label="Click me!" className="ma2" disabled onChange={action('Checked')} />
    </div>
)

export const Big = () => (
    <div>
        <Radio style={bigPicture} label="Click me!" className="ma2" onChange={action('Checked')} />
    </div>
)
