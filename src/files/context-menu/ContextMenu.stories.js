import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import i18n from '../../i18n-decorator'
import ContextMenu from './ContextMenu'

storiesOf('Files', module)
  .addDecorator(checkA11y)
  .addDecorator(i18n)
  .add('Context Menu', () => (
    <div className='ma3'>
      <ContextMenu
        top={10}
        left={10}
        hash={'QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC'}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={action('Navigate')}
        onCopyHash={action('Copy Hash')} />
    </div>
  ))
