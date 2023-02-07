import React from 'react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator.js'
import NewFolderModal from './NewFolderModal.js'

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
export const NewFolder = () => (
  <div className="ma3">
    <NewFolderModal onCancel={action('Cancel')} onSubmit={action('Submit')} />
  </div>
)
