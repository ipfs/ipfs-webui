import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import RenameModal from './RenameModal'

storiesOf('Files', module)
  .add('Rename Modal', () => (
    <div className='ma2'>
      <RenameModal filename='my-agenda.markdown' onCancel={action('Cancel')} onSubmit={action('Rename')} />
    </div>
  ))
