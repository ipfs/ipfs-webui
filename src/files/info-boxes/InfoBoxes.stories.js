// @ts-check
import InfoBoxes from './InfoBoxes'

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

export const Default = {
  title: 'Info Boxes'
}
