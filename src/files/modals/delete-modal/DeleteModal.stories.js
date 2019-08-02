import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator'
import DeleteModal from './DeleteModal'

storiesOf('Files/Modals', module)
  .addDecorator(i18n)
  .add('Delete', () => (
    <div className='ma3'>
      <DeleteModal
        onCancel={action('Cancel')}
        onDelete={action('Delete')}
        files={4}
        folders={0} />
    </div>
  ))
