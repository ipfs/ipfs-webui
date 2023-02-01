import { action } from '@storybook/addon-actions'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import i18nDecorator from '../../i18n-decorator.js'
import DndDecorator from '../../dnd-decorator.js'
import FilesList from './FilesList.js'
import { send } from '../../bundles/files/utils.js'
import { ACTIONS } from '../../bundles/files/consts.js'

// Fixtures
import filesListA from './fixtures/list-with-10-files.json'
import filesListC from './fixtures/list-with-100-files.json'
import filesListE from './fixtures/list-with-1000-files.json'
import filesListF from './fixtures/list-with-5000-files.json'

const updateSorting = (by, asc) => send({
  type: ACTIONS.UPDATE_SORT,
  payload: { by, asc }
})

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Files List',
  decorators: [i18nDecorator, DndDecorator, withKnobs],
  component: FilesList,
  parameters: {
    actions: {
      disable: false
    }
  },
  args: {
    root: '/',
    filesPathInfo: { isMfs: true },
    pins: [],
    filesIsFetching: boolean('filesIsFetching', false),
    onShare: action('Share'),
    onInspect: action('Inspect'),
    onRename: action('Rename'),
    onDownload: action('Download'),
    onRemove: action('Remove'),
    onNavigate: action('Navigate'),
    onCancelUpload: action('Cancel Upload'),
    onMove: action('Move'),
    onSetPinning: action('Set Pinning'),
    onAddFiles: action('Add Files'),
    handleContextMenuClick: action('Context Menu Click'),
    maxWidth: '100%',
    filesSorting: { by: 'name', asc: true },
    updateSorting
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith10Files = {
  name: 'List with 10 files',
  args: {
    files: filesListA
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith100Files = {
  name: 'List with 100 files',
  args: {
    files: filesListC
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith1000Files = {
  name: 'List with 1000 files',
  args: {
    files: filesListE
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith5000Files = {
  name: 'List with 5000 Files',
  args: {
    files: filesListF
  }
}
