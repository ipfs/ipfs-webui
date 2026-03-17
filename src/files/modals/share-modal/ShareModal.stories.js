import React from 'react'
import { action } from '@storybook/addon-actions'
import i18n from '../../../i18n-decorator.js'
import ShareModal from './ShareModal.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Modals',
  decorators: [i18n]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Share = () => (
  <div className="ma3">
    <ShareModal
      onLeave={action('Leave')}
      link="https://ipfs.io/ipfs/QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC"
      localLink="http://127.0.0.1:8080/ipfs/QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC"
      subdomainLocalLink="http://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.localhost:8080/"
    />
  </div>
)
