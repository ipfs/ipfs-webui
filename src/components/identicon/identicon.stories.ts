// @ts-check
import type { Meta, StoryObj } from '@storybook/react'
import { Identicon, type IdenticonProps } from './identicon'

const meta = {
  title: 'Identicon',
  component: Identicon,
  parameters: {
    actions: {
      disable: false,
      handles: ['click']
    }
  },
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 14
  }
} satisfies Meta<IdenticonProps>

export default meta

export const Default = {
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 14
  }
} as StoryObj<typeof Identicon>

export const Large = {
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 64
  }
} as StoryObj<typeof Identicon>
