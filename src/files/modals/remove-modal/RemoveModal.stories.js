import React from '@storybook/react';
import { action } from '@storybook/addon-actions';
import i18n from '../../../i18n-decorator';
import RemoveModal from './RemoveModal';

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
export const Remove = () => (
    <div className="ma3">
        <RemoveModal onCancel={action('Cancel')} onRemove={action('Remove')} files={4} folders={0} />
    </div>
);
