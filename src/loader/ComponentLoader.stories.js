import React from 'react'
import { storiesOf } from '@storybook/react'
import ComponentLoader from './ComponentLoader'

storiesOf('ComponentLoader', module)
  .add('Default', () => (
    <div className='flex items-center'>
      <ComponentLoader style={{ width: 100, margin: '100px auto' }}/>
      <ComponentLoader style={{ width: 200, margin: '100px auto' }}/>
      <ComponentLoader style={{ width: 300, margin: '100px auto' }}/>
    </div>
  ))
