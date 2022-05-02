import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../i18n'
import { PinningManager } from './PinningManager'
import PinningServicesMock from './fixtures/pinningServices'

storiesOf('Pinning Manager', module)
  .add('Default', () => (
    <div className='pa4 bg-light-gray'>
      <PinningManager
        t={i18n.getFixedT('en', 'settings')}
        pinningServices={PinningServicesMock}
        doFilesSizeGet={() => {}}
        doFilesFetch={() => {}}
        filesSize={1337}
      />
    </div>
  ))
