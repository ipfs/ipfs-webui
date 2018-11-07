import React from 'react'
import { storiesOf } from '@storybook/react'
import i18nDecorator from '../../i18n-decorator'
import LanguageSelector from './LanguageSelector'

storiesOf('Language Selector', module)
  .addDecorator(i18nDecorator)
  .add('Default', () => (
    <div className='pa4 bg-light-gray'>
      <LanguageSelector />
    </div>
  ))
