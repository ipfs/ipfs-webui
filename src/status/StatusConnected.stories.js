import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import i18n from '../i18n-decorator'

import { TranslatedStatusConnected as StatusConnected } from './StatusConnected.js'

storiesOf('StatusConnected', module)
  .addDecorator(i18n)
  .addDecorator(checkA11y)
  .add('Default', () => (
    <StatusConnected peersCount={1001} repoSize={123123912321312} downloadSize={123123912321312 / 2} sharedSize={123123912321312 * 2.3333}/>
  ))
