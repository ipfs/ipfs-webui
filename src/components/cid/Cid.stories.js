// import React from '@storybook/react'
// import { storiesOf } from '@storybook/react'
// import { action } from '@storybook/addon-actions'
// import { checkA11y } from '@storybook/addon-a11y'
import Cid from './Cid'

/**
 * @type {import('@storybook/react').Meta}
 */
const CidStory = {
  title: 'CID',
  component: Cid,
  parameters: {
    actions: {
      disable: false,
      handles: ['click']
    },
    argTypes: {
      onClick: { action: 'clicked' }
    },
    args: {
      value: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
      className: 'db ma2 monospace',
      identicon: false
    }
  }
}
export default CidStory

const Template = (args) => (
  <Cid className={args.className} value={args.value} identicon={args.identicon} />
)

export const CidV0 = Template.bind({})
CidV0.args = {
  className: 'db ma2 monospace',
  value: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
  identicon: false
}

export const CidV0Identicon = Template.bind({})
CidV0Identicon.args = {
  className: 'db ma2 monospace',
  value: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
  identicon: true
}

export const CidV1 = Template.bind({})
CidV1.args = {
  className: 'db ma2 monospace',
  value: 'zb2rhZMC2PFynWT7oBj7e6BpDpzge367etSQi6ZUA81EVVCxG',
  identicon: false
}

export const CidV1Sha3 = Template.bind({})
CidV1Sha3.args = {
  className: 'db ma2 monospace',
  value: 'zB7NbGN5wyfSbNNNwo3smZczHZutiWERdvWuMcHXTj393RnbhwsHjrP7bPDRPA79YWPbS69cZLWXSANcwUMmk4Rp3hP9Y',
  identicon: false
}
