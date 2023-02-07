import React from 'react'
import i18n from '../i18n-decorator.js'

import { TranslatedStatusConnected as StatusConnected } from './StatusConnected.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'StatusConnected',
  decorators: [i18n]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = () => <StatusConnected peersCount={1001} repoSize={123123912321312} />
