import React from 'react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator.js'
import RenameModal from './RenameModal.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Modals',
  decorators: [i18n]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Rename = () => (
  <div className="ma3">
    <RenameModal filename="my-agenda.markdown" onCancel={action('Cancel')} onSubmit={action('Rename')} />
  </div>
)
