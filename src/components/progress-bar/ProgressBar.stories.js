import React from 'react'
import { storiesOf } from '@storybook/react'
import ProgressBar from './ProgressBar'

storiesOf('Progress Bars', module)
  .add('Colors', () => (
    <div className='ma2'>
      <ProgressBar bg='bg-navy' progress={42} />
      <ProgressBar bg='bg-aqua' progress={54} />
      <ProgressBar bg='bg-gray' progress={78} />
      <ProgressBar bg='bg-charcoal' progress={21} />
      <ProgressBar bg='bg-red' progress={100} />
      <ProgressBar bg='bg-yellow' progress={94} />
      <ProgressBar bg='bg-teal' progress={23} />
      <ProgressBar bg='bg-green' progress={65} />
      <ProgressBar bg='bg-snow' progress={58} />
    </div>
  ))
  .add('CSS Animation', () => (
    <div className='ma2'>
      <ProgressBar bg='bg-navy' time={4} />
      <ProgressBar bg='bg-yellow' time={60} />
      <ProgressBar bg='bg-snow' time={20} />
    </div>
  ))
