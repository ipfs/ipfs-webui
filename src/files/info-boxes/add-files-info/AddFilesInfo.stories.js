import i18nDecorator from '../../../i18n-decorator'
import AddFilesInfo from './AddFilesInfo'

/**
 * @type {import('@storybook/react').Meta}
 */
const AddFilesInfoStory = {
  title: 'Files/Info Boxes',
  component: AddFilesInfo,
  decorators: [
    i18nDecorator
  ],
  render: () => {
    return (
      <div className='ma3 sans-serif'>
        <AddFilesInfo />
      </div>
    )
  }
}

export default AddFilesInfoStory

export const Default = {}
