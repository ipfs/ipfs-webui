import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import ContextMenu from './ContextMenu'

storiesOf('Files List', module)
  .addDecorator(checkA11y)
  .add('CTX menu', () => (
    <div className='ma2'>
      <ContextMenu
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
      />
    </div>
  ))
