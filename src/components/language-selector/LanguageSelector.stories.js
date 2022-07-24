// @ts-check
import React from '@storybook/react'

import i18n from '../../i18n'
import LanguageSelectorEl from './LanguageSelector'

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
    },
    argTypes: {
      onClick: { action: 'clicked' }
    },
    args: {
      lang: 'en',
      wrapperClassName: 'pa4 bg-light-gray'
    }
  }
}

const Template = (args) => <div className={args.wrapperClassName}>
  <LanguageSelectorEl t={i18n.getFixedT(args.lang, 'settings')} />
</div>

export const Default = Template.bind({ })

Default.args = {
  lang: 'en',
  wrapperClassName: 'pa4 bg-light-gray'
}
