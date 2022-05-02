import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { checkA11y } from '@storybook/addon-a11y'
import Cid from './Cid'

storiesOf('CID', module)
  .addDecorator(checkA11y)
  .add('CID v0', () => (
    <Cid className='db ma2 monospace' value={'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'} onClick={action('click')} />
  ))
  .add('CID v0 identicon', () => (
    <Cid className='dib ma2 monospace' value={'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW'} onClick={action('click')} identicon />
  ))
  .add('CID v1', () => (
    <Cid className='db ma2 monospace' value={'zb2rhZMC2PFynWT7oBj7e6BpDpzge367etSQi6ZUA81EVVCxG'} onClick={action('click')} />
  ))
  .add('CID v1 sha3', () => (
    <Cid className='db ma2 monospace' value={'zB7NbGN5wyfSbNNNwo3smZczHZutiWERdvWuMcHXTj393RnbhwsHjrP7bPDRPA79YWPbS69cZLWXSANcwUMmk4Rp3hP9Y'} onClick={action('click')} />
  ))
