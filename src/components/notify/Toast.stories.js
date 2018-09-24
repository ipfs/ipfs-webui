import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import Toast from './Toast'

storiesOf('Toast', module)
  .addDecorator(checkA11y)
  .add('default', () => (
    <div style={{ height: '100vh' }}>
      <Toast onDismiss={action('cancel')}>
        <b>Hurray!</b> New things are available.
      </Toast>
    </div>
  ))
  .add('error', () => (
    <div style={{ height: '100vh' }}>
      <Toast onDismiss={action('cancel')} error>
        Oh no! Something dreadful has occured.
      </Toast>
    </div>
  ))
