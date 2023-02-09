// @ts-check
import InfoBoxes from './InfoBoxes.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Info Boxes/InfoBoxes',
  component: InfoBoxes,
  args: {
    isRoot: true,
    isCompanion: true,
    filesExist: true
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  name: 'InfoBoxes'
}
