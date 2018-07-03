import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import { withKnobs, boolean } from '@storybook/addon-knobs'

import { NavBar } from './NavBar'

storiesOf('Nav', module)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .add('sidebar', () => (
    <div className='sans-serif bg-navy' style={{width: 240}}>
      <NavBar isSettingsEnabled={boolean('isSettingsEnabled', true)} />
    </div>
  ))
