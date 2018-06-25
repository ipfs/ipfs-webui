import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { IntlProvider } from 'react-intl'
import DeletePrompt from './DeletePrompt'

storiesOf('Files', module)
  .add('Delete Prompt', () => (
    <div className='ma2'>
    <IntlProvider locale='en'>
      <DeletePrompt cancel={action('Cancel')} action={action('Delete')} files={0} folders={2} />
    </IntlProvider>
    </div>
  ))
