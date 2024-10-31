import React from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components/pages'
import withTour from '../components/tour/withTour.js'

const ExploreContainer = ({
  toursEnabled,
  handleJoyrideCallback,
  availableGatewayUrl,
  publicGateway
}) => {
  return (
    <div className="e2e-explorePage">
      <ExplorePage
        runTour={toursEnabled}
        joyrideCallback={handleJoyrideCallback}
        gatewayUrl={availableGatewayUrl}
        publicGateway={publicGateway}
      />
    </div>
  )
}

export default connect(
  'selectToursEnabled',
  'selectAvailableGatewayUrl',
  'selectPublicGateway',
  withTour(ExploreContainer)
)
