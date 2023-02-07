import React from 'react'

import i18n from '../../i18n.js'
import PinningManager from './PinningManager.js'
import PinningServicesMock from './fixtures/pinningServices.js'

const t = i18n.getFixedT('en', 'settings')

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Pinning Manager',
  component: PinningManager,
  decorators: [storyFn => <div className="pa4 bg-light-gray">{storyFn()}</div>],
  args: {
    t,
    pinningServices: PinningServicesMock,
    doFilesSizeGet: () => {},
    doFilesFetch: () => {},
    filesSize: 1337
  }

}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {}
