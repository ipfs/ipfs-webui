import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator'
import NewFolderModal from './NewFolderModal'

storiesOf('Files/Modals', module)
  .addDecorator(i18n)
  .add('New Folder', () => (
    <div className='ma3'>
      <NewFolderModal
        onCancel={action('Cancel')}
        onSubmit={action('Submit')} />
    </div>
  ))
