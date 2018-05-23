import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import Checkbox from './Checkbox'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

storiesOf('Checkbox', module)
  .addDecorator(checkA11y)
  .add('Default', () => (
    <div>
      <Checkbox className='ma2' label='Click me!' onChange={action('Checked')} />
    </div>
  ))
  .add('Big', () => (
    <div>
      <Checkbox style={bigPicture} label='Click me!' className='ma2' onChange={action('Checked')} />
    </div>
  ))