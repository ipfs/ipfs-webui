import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import DeletePrompt from './DeletePrompt'

storiesOf('Files', module)
  .add('Delete Prompt', () => (
    <div className='ma2'>
      <DeletePrompt cancel={action('Cancel')} action={action('Delete')} files={0} folders={2} />
    </div>
  ))
