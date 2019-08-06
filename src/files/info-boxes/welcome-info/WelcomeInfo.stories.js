import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../../i18n-decorator'
import WelcomeInfo from './WelcomeInfo'

storiesOf('Files/Info Boxes', module)
  .addDecorator(i18n)
  .add('Welcome Info', () => (
    <div className='ma3 sans-serif'>
      <WelcomeInfo />
    </div>
  ))
