import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator'
import ShareModal from './ShareModal'

storiesOf('Files/Modals', module)
  .addDecorator(i18n)
  .add('Share', () => (
    <div className='ma3'>
      <ShareModal
        onLeave={action('Leave')}
        link='https://ipfs.io/ipfs/QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC' />
    </div>
  ))
