import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import i18n from '../../i18n-decorator'
import SelectedActions from './SelectedActions'

storiesOf('Files', module)
  .addDecorator(withKnobs)
  .addDecorator(i18n)
  .add('Selected Actions', () => (
    <div className='ma3'>
      <SelectedActions
        className='mb4'
        count={number('Count', 1)}
        size={345345}
        unselect={action('Unselect All')}
        remove={action('Delete Files')}
        share={action('Share Files')}
        download={action('Download Files')}
        rename={action('Rename Files')}
        inspect={action('Inspect Files')} />
    </div >
  ))
