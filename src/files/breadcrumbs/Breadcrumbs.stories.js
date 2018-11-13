import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import i18n from '../../i18n-decorator'
import Breadcrumbs from './Breadcrumbs'

storiesOf('Files', module)
  .addDecorator(checkA11y)
  .addDecorator(i18n)
  .add('Breadcrumbs', () => (
    <div className='ma3'>
      <Breadcrumbs
        path='/IPFS/MFS Home/images/other'
        onClick={action('Navigate')} />
    </div>
  ))
