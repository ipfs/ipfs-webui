// @ts-check
import React from '@storybook/react'

import i18n from '../../i18n'
import LanguageSelectorEl from './LanguageSelector'

const t = i18n.getFixedT('en', 'settings')

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'LanguageSelector',
  component: LanguageSelectorEl,
  parameters: {
    actions: {
      disable: false,
      handles: ['click .Button.tc']
    }
  },
  render: ({ wrapperClassName }) => (<div className={wrapperClassName}>
    <LanguageSelectorEl t={t} />
  </div>)
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  name: 'LanguageSelector',
  args: {
    wrapperClassName: 'pa4 bg-light-gray'
  }
}
