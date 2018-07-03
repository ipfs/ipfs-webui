import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'

import JsonEditor from './JsonEditor'

import config from './fixtures/example-config.json'

storiesOf('Settings page', module)
  .addDecorator(checkA11y)
  .add('JSON editor', () => (
    <JsonEditor defaultValue={config} />
  ))
