import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../i18n-decorator'
import StartExploringPage from './StartExploringPage'

storiesOf('Start Exploring page', module)
  .addDecorator(i18n)
  .add('default', () => (
    <StartExploringPage />
  ))
