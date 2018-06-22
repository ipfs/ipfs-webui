import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'

import { SettingsPage } from './SettingsPage'
import config from './editor/fixtures/example-config.json'

storiesOf('Settings page', module)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .add('edit go-ipfs config', () => (
    <div className='sans-serif'>
      <SettingsPage
        isLoading={boolean('isLoading', false)}
        isSaving={boolean('isSaving', false)}
        hasSaveFailed={boolean('hasSaveFailed', false)}
        hasSaveSucceded={boolean('hasSaveSucceded', false)}
        hasErrors={boolean('hasErrors', false)}
        hasLocalChanges={boolean('hasLocalChanges', false)}
        hasExternalChanges={boolean('hasExternalChanges', false)}
        config={JSON.stringify(config, null, 2)}
        editorKey={Date.now()}
        onChange={action('change')}
        onReset={action('reset')}
        onSave={action('save')} />
    </div>
  ))
