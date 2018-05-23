import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import SelectedActions from './SelectedActions'

storiesOf('Files', module)
  .add('Actions for One File', () => (
    <div className='ma2'>
      <SelectedActions
        count={1}
        size={345345}
        unselect={action('Unselect All')}
        remove={action('Delete Files')}
        share={action('Share Files')}
        download={action('Download Files')}
        rename={action('Rename Files')}
        inspect={action('Inspect Files')}
      />
    </div>
  ))
  .add('Actions for Multiple Files', () => (
    <div className='ma2'>
      <SelectedActions
        count={17}
        size={8518484848}
        unselect={action('Unselect All')}
        remove={action('Delete Files')}
        share={action('Share Files')}
        download={action('Download Files')}
        rename={action('Rename Files')}
        inspect={action('Inspect Files')}
      />
    </div>
  ))
