// @ts-check
import InfoBoxes from './InfoBoxes'

/**
 * @type {import('@storybook/react').Meta}
 */
const InfoBoxesStory = {
  title: 'Files/Info Boxes/InfoBoxes',
  component: InfoBoxes,
  args: {
    isRoot: true,
    isCompanion: true,
    filesExist: true
  }
}

export default InfoBoxesStory

export const Default = {
  title: 'Info Boxes'
}
