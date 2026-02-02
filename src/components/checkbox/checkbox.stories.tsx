import React from 'react'
import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import Checkbox from './checkbox.js'

const meta: Meta<typeof Checkbox> = {
  title: 'Checkbox',
  component: Checkbox
}

export default meta

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

export const Default: StoryObj<typeof Checkbox> = {
  render: () => (
    <div>
      <Checkbox className="ma2" label="Click me!" onChange={action('Checked')} />
    </div>
  )
}

export const Disabled: StoryObj<typeof Checkbox> = {
  render: () => (
    <div>
      <Checkbox label="Click me!" className="ma2" disabled onChange={action('Checked')} />
    </div>
  )
}

export const Big: StoryObj<typeof Checkbox> = {
  render: () => (
    <div>
      <Checkbox style={bigPicture} label="Click me!" className="ma2" onChange={action('Checked')} />
    </div>
  )
}
