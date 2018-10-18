import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'

// Components
import JsonEditor from './JsonEditor'

// Fixtures
import config from './fixtures/example-config.json'

storiesOf('JSON Editor', module)
  .addDecorator(checkA11y)
  .add('Default', () => (
    <JsonEditor value={JSON.stringify(config, null, 2)} />
  ))
