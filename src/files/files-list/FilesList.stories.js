import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18nDecorator from '../../i18n-decorator'
import DndDecorator from '../../dnd-decorator'
import FilesList from './FilesList'
// Fixtures
import filesListA from './fixtures/list-with-10-files.json'
import filesListC from './fixtures/list-with-100-files.json'
import filesListE from './fixtures/list-with-1000-files.json'
import filesListF from './fixtures/list-with-5000-files.json'

storiesOf('Files/Files List', module)
  .addDecorator(i18nDecorator)
  .addDecorator(DndDecorator)
  .addDecorator(withKnobs)
  .add('List with 10 files', () => (
    <div className='h-100'>
      <FilesList
        root='/'
        filesPathInfo={{ isMfs: true }}
        pins={[]}
        files={filesListA}
        filesIsFetching={boolean('filesIsFetching', false)}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCancelUpload={action('Cancel Upload')}
        maxWidth={'100%'}
        filesSorting={{ by: 'name', asc: true }} />
    </div>
  ))
  .add('List with 100 files', () => (
    <div className='h-100'>
      <FilesList
        root='/'
        filesPathInfo={{ isMfs: true }}
        pins={[]}
        files={filesListC}
        filesIsFetching={boolean('filesIsFetching', false)}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCancelUpload={action('Cancel Upload')}
        maxWidth={'100%'}
        filesSorting={{ by: 'name', asc: true }} />
    </div>
  ))
  .add('List with 1000 files', () => (
    <div className='h-100'>
      <FilesList
        root='/'
        filesPathInfo={{ isMfs: true }}
        pins={[]}
        files={filesListE}
        filesIsFetching={boolean('filesIsFetching', false)}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCancelUpload={action('Cancel Upload')}
        maxWidth={'100%'}
        filesSorting={{ by: 'name', asc: true }} />
    </div>
  ))
  .add('List with 5000 files', () => (
    <div className='h-100'>
      <FilesList
        root='/'
        filesPathInfo={{ isMfs: true }}
        pins={[]}
        files={filesListF}
        filesIsFetching={boolean('filesIsFetching', false)}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCancelUpload={action('Cancel Upload')}
        maxWidth={'100%'}
        filesSorting={{ by: 'name', asc: true }} />
    </div>
  ))
