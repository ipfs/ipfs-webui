import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import FilesList from './FilesList'
import fixture from './fixtures/root.json'

storiesOf('Files List', module)
  .add('Default', () => (
    <div className='ma2'>
      <FilesList
        files={fixture}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
      />
    </div>
  ))
