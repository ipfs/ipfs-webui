import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18n from '../i18n'
import { NavBar } from './NavBar'

storiesOf('NavBar', module)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <div className='sans-serif vh-100 bg-navy' style={{ width: 156 }}>
      <NavBar
        width='160px'
        isSettingsEnabled={boolean('isSettingsEnabled', true)}
        open={boolean('open', true)}
        onToggle={action('onToggle')}
        t={i18n.getFixedT('en', 'status')} />
    </div>
  ))
