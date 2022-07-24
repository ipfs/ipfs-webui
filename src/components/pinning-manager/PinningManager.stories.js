import React from '@storybook/react';
import i18n from '../../i18n';
import { PinningManager } from './PinningManager';
import PinningServicesMock from './fixtures/pinningServices';

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
    title: 'Pinning Manager',
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => (
    <div className="pa4 bg-light-gray">
        <PinningManager
            t={i18n.getFixedT('en', 'settings')}
            pinningServices={PinningServicesMock}
            doFilesSizeGet={() => {}}
            doFilesFetch={() => {}}
            filesSize={1337}
        />
    </div>
);
