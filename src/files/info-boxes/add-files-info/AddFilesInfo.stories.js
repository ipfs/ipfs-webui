// @ts-check
import i18nDecorator from '../../../i18n-decorator'
import AddFilesInfo from './AddFilesInfo'

/**
 * @type {import('@storybook/react').Meta}
 */
const AddFilesInfoStory = {
  title: 'Files/Info Boxes/AddFilesInfo',
  component: AddFilesInfo,
  decorators: [
    i18nDecorator
  ]
}

export default AddFilesInfoStory

export const Default = {}
