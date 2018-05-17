import React from 'react'

import { storiesOf } from '@storybook/react'

import File from './File'

storiesOf('File', module)
  .add('regular', () => (
    <File />
  ))
