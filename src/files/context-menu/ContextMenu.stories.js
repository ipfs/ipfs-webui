// @ts-check
import ContextMenu from './ContextMenu.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Context Menu',
  component: ContextMenu,
  args: {
    isOpen: true,
    isMfs: false,
    pinned: false,
    cid: 'QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC',
    top: 10,
    left: 10
  },
  argTypes: {
    onShare: { action: 'Share' },
    onInspect: { action: 'Inspect' },
    onRename: { action: 'Rename' },
    onDownload: { action: 'Download' },
    onDownloadCar: { action: 'Download CAR' },
    onRemove: { action: 'Remove' },
    handleClick: { action: 'Handle Click' },
    onNavigate: { action: 'Navigate' },
    onCopyHash: { action: 'Copy CID' }
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {}
