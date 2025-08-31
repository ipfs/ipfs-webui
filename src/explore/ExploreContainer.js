import React from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components/pages'
import { useTours } from '../contexts/tours-context.js'

const ExploreContainer = ({ availableGatewayUrl, publicGateway }) => {
  const { enabled, handleJoyrideCallback } = useTours()

  return (
    <div className="e2e-explorePage">
      <ExplorePage
        runTour={enabled}
        joyrideCallback={handleJoyrideCallback}
        gatewayUrl={availableGatewayUrl}
        publicGateway={publicGateway}
      />
    </div>
  )
}

export default connect(
  'selectAvailableGatewayUrl',
  'selectPublicGateway',
  ExploreContainer
)
