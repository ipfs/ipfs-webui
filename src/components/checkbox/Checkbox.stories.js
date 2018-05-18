import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Checkbox from './Checkbox'
import { checkA11y } from '@storybook/addon-a11y'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

storiesOf('Checkbox', module)
  .addDecorator(checkA11y)
  .add('Default', () => (
    <div>
      <Checkbox className='ma2' onChange={action('Checked')} />
    </div>
  ))
  .add('Big', () => (
    <div>
      <Checkbox style={bigPicture} className='ma2' onChange={action('Checked')} />
    </div>
  ))
