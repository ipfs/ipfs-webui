// @ts-check
import FilesExploreForm from './files-explore-form'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Explore Form',
  component: FilesExploreForm,
  argTypes: {
    onBrowse: { action: 'Browse' },
    onInspect: { action: 'Inspect' }
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {}
