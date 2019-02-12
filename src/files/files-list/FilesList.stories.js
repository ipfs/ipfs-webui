import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18nDecorator from '../../i18n-decorator'
import DndDecorator from '../../dnd-decorator'
import { FilesListWithDropTarget as FilesList } from './FilesList'
// Fixtures
import filesListA from './fixtures/list-with-10-files.json'
import filesListB from './fixtures/list-with-50-files.json'
import filesListC from './fixtures/list-with-100-files.json'
import filesListD from './fixtures/list-with-500-files.json'
import filesListE from './fixtures/list-with-1000-files.json'
import filesListF from './fixtures/list-with-5000-files.json'

storiesOf('Files List', module)
  .addDecorator(i18nDecorator)
  .addDecorator(DndDecorator)
  .add('List with 10 files', () => (
    <div className='ma4'>
      <FilesList
        root='/'
        files={filesListA}
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
  .add('List with 50 files', () => (
    <div className='ma4'>
      <FilesList
        root='/'
        files={filesListB}
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
  .add('List with 100 files', () => (
    <div className='ma4'>
      <FilesList
        root='/'
        files={filesListC}
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
  .add('List with 500 files', () => (
    <div className='ma4'>
      <FilesList
        root='/'
        files={filesListD}
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
  .add('List with 1000 files', () => (
    <div className='ma4'>
      <FilesList
        root='/'
        files={filesListE}
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
  .add('List with 5000 files', () => (
    <div className='ma4'>
      <FilesList
        root='/'
        files={filesListF}
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
