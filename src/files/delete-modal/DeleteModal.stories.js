import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import DeleteModal from './DeleteModal'

storiesOf('Files', module)
  .add('Delete Modal', () => (
    <div>
      <DeleteModal className='ma3' onCancel={action('Cancel')} onDelete={action('Delete')} files={0} folders={1} />
      <DeleteModal className='ma3' onCancel={action('Cancel')} onDelete={action('Delete')} files={0} folders={2} />
      <DeleteModal className='ma3' onCancel={action('Cancel')} onDelete={action('Delete')} files={1} folders={0} />
      <DeleteModal className='ma3' onCancel={action('Cancel')} onDelete={action('Delete')} files={4} folders={0} />
      <DeleteModal className='ma3' onCancel={action('Cancel')} onDelete={action('Delete')} files={1} folders={1} />
    </div>
  ))
