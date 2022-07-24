import React from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';
import i18n from '../i18n-decorator';

import { TranslatedStatusConnected as StatusConnected } from './StatusConnected.js';

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
    title: 'StatusConnected',
    decorators: [i18n, checkA11y],
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => <StatusConnected peersCount={1001} repoSize={123123912321312} />;
