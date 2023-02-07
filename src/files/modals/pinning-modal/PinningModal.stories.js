import React from 'react'
import { action } from '@storybook/addon-actions'

import i18n from '../../../i18n.js'
import PinningModal from './PinningModal.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Modals/Pinning',
  args: {
    lang: 'en',
    onCancel: action('Cancel'),
    onSubmit: action('Pinning'),
    file: {
      pinned: false,
      cid: 'QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC'
    },
    remotePins: [],
    notRemotePins: [],
    onPinningSet: action('PinningSet')
  },
  render: (args) => {
    const { lang, ...componentArgs } = args
    return (
      <PinningModal t={i18n.getFixedT(args.lang, 'settings')} {...componentArgs} />
    )
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const UnPinnedFile = {}

export const PinnedFile = {
  args: {
    file: {
      cid: 'QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC',
      pinned: true
    }
  }
}
