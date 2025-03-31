import React from 'react';
import { action } from '@storybook/addon-actions';
import i18n from '../../../i18n-decorator.js';
import AddByPathModal from './AddByPathModal.js';

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Modals',
  decorators: [i18n],
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const AddByPath = () => (
  <div className="ma3">
    <AddByPathModal onCancel={action('Cancel')} onSubmit={action('Submit')} files={4} folders={0} />
  </div>
);
