import React from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components'
import withTour from '../components/tour/withTour'

const ExploreContainer = ({
  toursEnabled,
  handleJoyrideCallback,
  availableGatewayUrl,
  publicGateway
}) => (
  <ExplorePage
    runTour={toursEnabled}
    joyrideCallback={handleJoyrideCallback}
    gatewayUrl={availableGatewayUrl}
    publicGateway={publicGateway}
  />
)

export default connect(
  'selectToursEnabled',
  'selectAvailableGatewayUrl',
  'selectPublicGateway',
  withTour(ExploreContainer)
)
