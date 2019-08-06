import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator'
import AddByPathModal from './AddByPathModal'

storiesOf('Files/Modals', module)
  .addDecorator(i18n)
  .add('Add By Path', () => (
    <div className='ma3'>
      <AddByPathModal
        onCancel={action('Cancel')}
        onSubmit={action('Delete')}
        files={4}
        folders={0} />
    </div>
  ))
