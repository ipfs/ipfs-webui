import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18n from '../i18n'
import { SettingsPage } from './SettingsPage'
import config from './editor/fixtures/example-config.json'

storiesOf('Settings Page', module)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <div className='sans-serif'>
      <SettingsPage
        t={i18n.getFixedT('en', 'settings')}
        isLoading={boolean('isLoading', false)}
        isSaving={boolean('isSaving', false)}
        hasSaveFailed={boolean('hasSaveFailed', false)}
        hasSaveSucceded={boolean('hasSaveSucceded', false)}
        hasErrors={boolean('hasErrors', false)}
        hasLocalChanges={boolean('hasLocalChanges', true)}
        hasExternalChanges={boolean('hasExternalChanges', false)}
        config={JSON.stringify(config, null, 2)}
        editorKey={Date.now()}
        onChange={action('change')}
        onReset={action('reset')}
        onSave={action('save')} />
    </div>
  ))
