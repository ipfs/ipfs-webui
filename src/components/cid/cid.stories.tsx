import Cid from './cid'

const meta = {
  title: 'CID',
  component: Cid,
  parameters: {
    actions: { disable: false }
  },
  argTypes: {
    onClick: { action: 'clicked' }
  },
  args: {
    className: 'db ma2 monospace',
    value: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    identicon: false
  }
} as const

export default meta

export const CidV0 = {}

export const CidV0Identicon = {
  args: { identicon: true }
}

export const CidV1 = {
  args: {
    value: 'zb2rhZMC2PFynWT7oBj7e6BpDpzge367etSQi6ZUA81EVVCxG'
  }
}

export const CidV1Sha3 = {
  args: {
    value: 'zB7NbGN5wyfSbNNNwo3smZczHZutiWERdvWuMcHXTj393RnbhwsHjrP7bPDRPA79YWPbS69cZLWXSANcwUMmk4Rp3hP9Y'
  }
}
