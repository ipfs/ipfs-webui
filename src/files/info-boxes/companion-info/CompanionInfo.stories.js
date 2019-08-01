import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../../i18n-decorator'
import CompanionInfo from './CompanionInfo'

storiesOf('Files/Info Boxes', module)
  .addDecorator(i18n)
  .add('Companion Info', () => (
    <div className='ma3 sans-serif'>
      <CompanionInfo />
    </div>
  ))
