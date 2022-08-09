import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n'
import { PublishModal } from './PublishModal'

storiesOf('Files/Modals', module)
  .add('Publishing', () => (
    <div className='ma3'>
      <PublishModal
        t={i18n.getFixedT('en', 'files')}
        onCancel={action('Cancel')}
        onSubmit={action('Publish')} />
    </div>
  ))
