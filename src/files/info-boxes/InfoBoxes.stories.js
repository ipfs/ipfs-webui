import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18n from '../../i18n-decorator'
import InfoBoxes from './InfoBoxes'

storiesOf('Files/Info Boxes', module)
  .addDecorator(i18n)
  .addDecorator(withKnobs)
  .add('Info Boxes', () => (
    <div className='ma3 sans-serif'>
      <InfoBoxes
        isRoot={boolean('isRoot', true)}
        isCompanion={boolean('isCompanion', true)}
        filesExist={boolean('filesExist', true)} />
    </div>
  ))
