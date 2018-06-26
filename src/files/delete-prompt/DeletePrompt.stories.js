import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { IntlProvider } from 'react-intl'
import DeletePrompt from './DeletePrompt'

storiesOf('Files', module)
  .add('Delete Prompt', () => (
    <IntlProvider locale='en'>
      <div>
        <DeletePrompt className='ma3' cancel={action('Cancel')} action={action('Delete')} files={0} folders={1} />
        <DeletePrompt className='ma3' cancel={action('Cancel')} action={action('Delete')} files={0} folders={2} />
        <DeletePrompt className='ma3' cancel={action('Cancel')} action={action('Delete')} files={1} folders={0} />
        <DeletePrompt className='ma3' cancel={action('Cancel')} action={action('Delete')} files={4} folders={0} />
        <DeletePrompt className='ma3' cancel={action('Cancel')} action={action('Delete')} files={1} folders={1} />
      </div>
    </IntlProvider>
  ))
