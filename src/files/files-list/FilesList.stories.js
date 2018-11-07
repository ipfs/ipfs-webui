import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18nDecorator from '../../i18n-decorator'
import DndDecorator from '../../dnd-decorator'
import fixture from './fixtures/root.json'
import FilesList from './FilesList'

storiesOf('Files', module)
  .addDecorator(i18nDecorator)
  .addDecorator(DndDecorator)
  .add('Files List', () => (
    <div className='ma4'>
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
        maxWidth={'100%'}
        sort={{ by: 'name', asc: true }} />
    </div>
  ))
