// @ts-check
import i18nDecorator from '../../../i18n-decorator.js'
import AddFilesInfo from './AddFilesInfo.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Info Boxes/AddFilesInfo',
  component: AddFilesInfo,
  decorators: [
    i18nDecorator
  ]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  name: 'AddFilesInfo'
}
