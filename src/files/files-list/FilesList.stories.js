import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import FilesList from './FilesList'

const filesList = [
  {
    name: 'File 1.txt',
    type: 'file',
    size: 584451,
    hash: 'Qm1',
    status: 74
  },
  {
    name: 'File 1.txt',
    type: 'file',
    size: 42452,
    hash: 'Qm2'
  },
  {
    name: 'A folder',
    type: 'directory',
    size: 54528448,
    hash: 'Qm3'
  },
  {
    name: 'Lorem ipsum.docx',
    type: 'file',
    size: 12425,
    hash: 'Qm4'
  }
]

storiesOf('Files List', module)
  .add('Colors', () => (
    <div className='ma2'>
      <FilesList
        files={filesList}
        onShare={action('Share')}
        onIPLD={action('Inspect IPLD')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
      />
    </div>
  ))
