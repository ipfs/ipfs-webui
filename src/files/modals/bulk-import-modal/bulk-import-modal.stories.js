import React from 'react';
import { action } from '@storybook/addon-actions';
import i18n from '../../../i18n-decorator.js';
import BulkImportModal from './bulk-import-modal.tsx';

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
export const BulkImport = () => (
  <div className="ma3">
    <BulkImportModal onCancel={action('Cancel')} onBulkCidImport={action('Bulk CID Import')} />
  </div>
);
