import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
// import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'

import ComponentLoader from './ComponentLoader'

storiesOf('Loader', module)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .add('ComponentLoader', () => (
    <div className='sans-serif pa4' style={{ height: 400 }}>
      <ComponentLoader
        pastDelay={boolean('pastDelay', true)}
      />
    </div>
  ))
