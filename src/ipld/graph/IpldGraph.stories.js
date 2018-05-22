import React from 'react'
import { storiesOf } from '@storybook/react'
// import { action } from '@storybook/addon-actions'
import IpldGraph from './IpldGraph'

storiesOf('Ipld Graph', module)
  .add('3 links', () => (
    <IpldGraph />
  ))
