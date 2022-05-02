import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../i18n'
import LanguageSelector from './LanguageSelector'

storiesOf('Language Selector', module)
  .add('Default', () => (
    <div className='pa4 bg-light-gray'>
      <LanguageSelector t={i18n.getFixedT('en', 'settings')} />
    </div>
  ))
