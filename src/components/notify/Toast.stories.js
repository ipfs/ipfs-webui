import React from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { checkA11y } from '@storybook/addon-a11y';
import Toast from './Toast';

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
    title: 'Toast',
    decorators: [checkA11y],
};

export const Default = () => (
    <div style={{ height: '100vh' }}>
        <Toast onDismiss={action('cancel')}>
            <b>Hurray!</b> New things are available.
        </Toast>
    </div>
);

export const Error = () => (
    <div style={{ height: '100vh' }}>
        <Toast onDismiss={action('cancel')} error>
            Oh no! Something dreadful has occured.
        </Toast>
    </div>
);
