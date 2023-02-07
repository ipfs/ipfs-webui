import React from 'react'
import { withKnobs, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import i18n from '../../i18n-decorator.js'
import SelectedActions from './SelectedActions.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files',
  decorators: [withKnobs, i18n]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const _SelectedActions = () => (
  <div className="ma3">
    <SelectedActions
      className="mb4"
      count={number('Count', 1)}
      size={345345}
      unselect={action('Unselect All')}
      remove={action('Remove Files')}
      share={action('Share Files')}
      download={action('Download Files')}
      rename={action('Rename Files')}
      inspect={action('Inspect Files')}
    />
  </div>
)
