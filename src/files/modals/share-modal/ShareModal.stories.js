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
    />
  </div>
)
