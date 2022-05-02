import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n'
import { PinningModal } from './PinningModal'

storiesOf('Files/Modals', module)
  .add('Pinning', () => (
    <div className='ma3'>
      <PinningModal
        t={i18n.getFixedT('en', 'files')}
        onCancel={action('Cancel')}
        onSubmit={action('Pinning')} />
    </div>
  ))
