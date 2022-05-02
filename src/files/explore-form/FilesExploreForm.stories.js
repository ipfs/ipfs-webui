import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import i18n from '../../i18n-decorator'
import FilesExploreForm from './FilesExploreForm'

storiesOf('Files', module)
  .addDecorator(checkA11y)
  .addDecorator(i18n)
  .add('Explore Form', () => (
    <div className='ma3 pa3 bg-snow-muted mw6'>
      <FilesExploreForm onBrowse={action('Browse')} onInspect={action('Inspect')} />
    </div>
  ))
