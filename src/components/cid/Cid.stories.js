import Cid from './Cid.js'

/**
 * @type {import('@storybook/react').Meta}
 */
const CidStory = {
  title: 'CID',
  component: Cid,
  parameters: {
    actions: {
      disable: false
    }
  },
  argTypes: {
    onClick: { action: 'clicked' }
  }
}
export default CidStory

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const CidV0 = {
  args: {
    className: 'db ma2 monospace',
    value: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    identicon: false
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const CidV0Identicon = {
  args: {
    className: 'db ma2 monospace',
    value: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    identicon: true
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const CidV1 = {
  args: {
    className: 'db ma2 monospace',
    value: 'zb2rhZMC2PFynWT7oBj7e6BpDpzge367etSQi6ZUA81EVVCxG',
    identicon: false
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const CidV1Sha3 = {
  args: {
    className: 'db ma2 monospace',
    value: 'zB7NbGN5wyfSbNNNwo3smZczHZutiWERdvWuMcHXTj393RnbhwsHjrP7bPDRPA79YWPbS69cZLWXSANcwUMmk4Rp3hP9Y',
    identicon: false
  }
}
