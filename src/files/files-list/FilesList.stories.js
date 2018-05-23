import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import FilesList from './FilesList'
import fixture from './fixtures/root.json'

storiesOf('Files', module)
  .add('Files List', () => (
    <div className='ma2'>
      <FilesList
        root='/'
        files={fixture}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCancelUpload={action('Cancel Upload')}
      />
    </div>
  ))
