import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Button from './Button'

storiesOf('Button', module)
  .add('Colors', () => (
    <div>
      <Button className='ma2' onClick={action('aqua-click')}>Aqua</Button>
      <Button className='ma2' bg='bg-teal' onClick={action('teal-click')}>Teal</Button>
      <Button className='ma2' bg='bg-navy' onClick={action('navy-click')}>Navy</Button>
      <Button className='ma2' bg='bg-orange' onClick={action('orange-click')}>Orange</Button>
      <Button className='ma2' bg='bg-red' onClick={action('red-click')}>Red</Button>
      <Button className='ma2' disabled onClick={action('disabled-click')}>Disabled</Button>
    </div>
  ))
