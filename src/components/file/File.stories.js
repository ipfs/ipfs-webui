import React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import File from './File'

storiesOf('File', module)
  .add('regular', () => (
    <File></File>
  ));
  