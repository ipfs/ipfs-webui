import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../i18n-decorator'
import RenameModal from './RenameModal'

storiesOf('Files', module)
  .addDecorator(i18n)
  .add('Rename Modal', () => (
    <div className='ma3'>
      <RenameModal
        filename='my-agenda.markdown'
        onCancel={action('Cancel')}
        onSubmit={action('Rename')} />
    </div>
  ))
