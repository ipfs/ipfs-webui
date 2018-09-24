import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import ContextMenu from './ContextMenu'

storiesOf('Files', module)
  .addDecorator(checkA11y)
  .add('Context Menu', () => (
    <div className='ma2'>
      <ContextMenu
        top={10}
        left={10}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCopyHash={action('Copy Hash')}
      />
    </div>
  ))
