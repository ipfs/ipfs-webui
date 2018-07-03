import React from 'react'
import { Helmet } from 'react-helmet'

// Components
import WorldMap from './WorldMap/WorldMap'
import PeersTable from './PeersTable/PeersTable'

export class PeersPage extends React.Component {
  render () {
    return (
      <div data-id='PeersPage'>
        <Helmet>
          <title>Peers - IPFS</title>
        </Helmet>

        <div className='bg-snow-muted pa3'>
          <WorldMap />
          <PeersTable />
        </div>
      </div>
    )
  }
}

export default PeersPage
