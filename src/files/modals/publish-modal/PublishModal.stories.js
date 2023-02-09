import { action } from '@storybook/addon-actions'

import i18n from '../../../i18n.js'
import { PublishModal } from './PublishModal.js'

const ipnsKeys = [
  {
    name: 'ipnsKey1',
    id: 'ipnsKey1',
    published: false
  },
  {
    name: 'ipnsKey2',
    id: 'ipnsKey2',
    published: false
  },
  {
    name: 'ipnsKey3',
    id: 'ipnsKey3',
    published: true
  }
]

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Modals',
  component: PublishModal,
  decorators: [
    (storyFn, storyContext) => {
      const onSubmit = async () => await new Promise(resolve => setTimeout(resolve, storyContext.args.expectedPublishTime * 1000))
      return storyFn({
        args: {
          ...storyContext.args,
          onSubmit
        }
      })
    }
  ],
  args: {
    t: i18n.getFixedT('en', 'files'),
    onLeave: action('Leave'),
    onSubmit: async () => {},
    file: {
      pinned: false,
      cid: 'QmQK3p7MmycDutWkWAzJ4hNN1YBKK9bLTDz9jTtkWf16wC'
    },
    ipnsKeys,
    publicGateway: 'gateway',
    className: 'ma3',
    doFetchIpnsKeys: () => ipnsKeys,
    doUpdateExpectedPublishTime: (time) => action(`Update expected publish time: ${time}`),
    expectedPublishTime: 5
  },
  argTypes: {
    expectedPublishTime: {
      control: {
        type: 'number',
        min: 0,
        max: 60,
        step: 1
      }
    }
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Publishing = {}
