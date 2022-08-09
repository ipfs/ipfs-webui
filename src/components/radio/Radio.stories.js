import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import Radio from './Radio'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

storiesOf('Radio', module)
  .addDecorator(checkA11y)
  .add('Default', () => (
    <div>
      <Radio className='ma2' label='Click me!' onChange={action('Checked')} />
    </div>
  ))
  .add('Disabled', () => (
    <div>
      <Radio label='Click me!' className='ma2' disabled onChange={action('Checked')} />
    </div>
  ))
  .add('Big', () => (
    <div>
      <Radio style={bigPicture} label='Click me!' className='ma2' onChange={action('Checked')} />
    </div>
  ))
