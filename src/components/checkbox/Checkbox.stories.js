import React from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { checkA11y } from '@storybook/addon-a11y';
import Checkbox from './Checkbox';

const bigPicture = {
    transform: 'scale(5)',
    transformOrigin: 'top left',
};

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
    title: 'Checkbox',
    decorators: [checkA11y],
};

export const Default = () => (
    <div>
        <Checkbox className="ma2" label="Click me!" onChange={action('Checked')} />
    </div>
);

export const Disabled = () => (
    <div>
        <Checkbox label="Click me!" className="ma2" disabled onChange={action('Checked')} />
    </div>
);

export const Big = () => (
    <div>
        <Checkbox style={bigPicture} label="Click me!" className="ma2" onChange={action('Checked')} />
    </div>
);
