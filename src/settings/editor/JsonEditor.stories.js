import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'

import JsonEditor from './JsonEditor'

import config from './fixtures/example-config.json'

storiesOf('Config Editor', module)
  .addDecorator(checkA11y)
  .add('edit go-ipfs config', () => (
    <JsonEditor defaultValue={config} />
  ))
