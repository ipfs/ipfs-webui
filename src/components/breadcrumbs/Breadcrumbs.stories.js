import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Breadcrumbs from './Breadcrumbs'

storiesOf('Breadcrumbs', module)
  .add('Default', () => (
    <div>
      <Breadcrumbs
        className='ma2'
        path='/IPFS/MFS Home/images/other'
        onClick={action('Navigate')}
      />
    </div>
  ))
