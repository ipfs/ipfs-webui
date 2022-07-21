// @ts-check
import React from '@storybook/react'
import IdenticonEl from './Identicon'

/**
 * @type {import('@storybook/react').Meta}
 */
const IdenticonStory = {
  title: 'Identicon',
  component: IdenticonEl,
  parameters: {
    actions: {
      disable: false,
      handles: ['click']
    },
    argTypes: {
      onClick: { action: 'clicked' }
    },
    args: {
      cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
      className: 'ma2',
      size: 14
    }
  }
}
export default IdenticonStory

const Template = (args) => (
  <IdenticonEl cid={args.cid} className={args.className} size={args.size} />
)

export const Default = Template.bind({})
Default.args = {
  cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
  className: 'ma2',
  size: 14
}

export const Large = Template.bind({})

Large.args = {
  cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
  className: 'ma2',
  size: 64
}
