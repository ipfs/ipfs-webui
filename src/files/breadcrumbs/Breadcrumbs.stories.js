import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import i18n from '../../i18n-decorator'
import Breadcrumbs from './Breadcrumbs'

storiesOf('Files/Header', module)
  .addDecorator(checkA11y)
  .addDecorator(i18n)
  .add('Breadcrumbs', () => (
    <div className='ma3'>
      <Breadcrumbs
        path='/home/this is a very very very long folder/another sub path/oi/other'
        onClick={action('Navigate')} />

      <Breadcrumbs
        path='/ipns/ipfs.io/index.html'
        onClick={action('Navigate')} />
    </div>
  ))
