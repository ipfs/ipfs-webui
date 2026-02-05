// @ts-check
import { Identicon } from './identicon'

const meta = {
  title: 'Identicon',
  component: Identicon,
  parameters: {
    actions: { disable: false, handles: ['click'] }
  },
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 14
  }
} as const

export default meta

export const Default = {}

export const Large = {
  args: { size: 64 }
}
