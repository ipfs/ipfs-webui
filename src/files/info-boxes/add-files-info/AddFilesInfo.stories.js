import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../../i18n-decorator'
import AddFilesInfo from './AddFilesInfo'

storiesOf('Files/Info Boxes', module)
  .addDecorator(i18n)
  .add('Add Files', () => (
    <div className='ma3 sans-serif'>
      <AddFilesInfo />
    </div>
  ))
