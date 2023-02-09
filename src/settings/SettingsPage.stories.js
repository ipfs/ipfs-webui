import React from 'react'

import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18n from '../i18n.js'
import { SettingsPage } from './SettingsPage.js'
import i18nDecorator from '../i18n-decorator.js'
import config from './editor/fixtures/example-config.json'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Settings Page',
  decorators: [withKnobs, i18nDecorator]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => (
  <div className="sans-serif">
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
      onSave={action('save')}
    />
  </div>
)
