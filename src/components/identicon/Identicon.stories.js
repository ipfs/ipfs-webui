import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import Identicon from './Identicon'

storiesOf('Identicon', module)
  .addDecorator(checkA11y)
  .add('Identicon', () => (
    <Identicon cid={'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'} onClick={action('click')} className='ma2' />
  ))
