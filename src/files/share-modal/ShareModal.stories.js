import React from 'react'
import { storiesOf } from '@storybook/react'
import i18n from '../../i18n-decorator'
import ShareModal from './ShareModal'

storiesOf('Files', module)
  .addDecorator(i18n)
  .add('Share Modal', () => (
    <div className='ma3'>
      <ShareModal link='https://ipfs.io/ipfs/QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC' />
    </div>
  ))
