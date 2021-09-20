import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18n from '../../i18n-decorator'
import ContextMenu from './ContextMenu'

storiesOf('Files', module)
  .addDecorator(checkA11y)
  .addDecorator(withKnobs)
  .addDecorator(i18n)
  .add('Context Menu', () => (
    <div className='ma3'>
      <ContextMenu
        isOpen={boolean('isOpen', false)}
        isMfs={boolean('isMfs', false)}
        pinned={boolean('pinned', false)}
        top={10}
        left={10}
        cid={'QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC'}
        onShare={action('Share')}
        onPublish={action('Publish With IPNS')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onRemove={action('Remove')}
        handleClick={action('Handle Click')}
        onNavigate={action('Navigate')}
        onCopyHash={action('Copy CID')} />
    </div>
  ))
