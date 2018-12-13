import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import i18n from '../i18n-decorator'

import StatusNotConnected from './StatusNotConnected.js'

storiesOf('StatusNotConnected', module)
  .addDecorator(i18n)
  .addDecorator(checkA11y)
  .add('Default', () => (
    <StatusNotConnected />
  ))
