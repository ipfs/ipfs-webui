import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import RenamePrompt from './RenamePrompt'

storiesOf('Files', module)
  .add('Rename Prompt', () => (
    <div className='ma2'>
      <RenamePrompt filename='my-agenda.markdown' onCancel={action('Cancel')} onSubmit={action('Rename')} />
    </div>
  ))
