import React from 'react'

import {
  Pane,
  Header
} from 'ipfs-react-components'

export default function NotFound () {
  return (
    <Pane>
      <Header title='Not Found' />
      <p>What ya doing here? Get out!</p>
    </Pane>
  )
}
