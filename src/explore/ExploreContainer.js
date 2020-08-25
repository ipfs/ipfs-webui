import React from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components'
import withTour from '../components/tour/withTour'

const ExploreContainer = ({
  toursEnabled,
  handleJoyrideCallback,
  availableGatewayUrl
}) => (
  <ExplorePage
    runTour={toursEnabled}
    joyrideCallback={handleJoyrideCallback}
    gatewayUrl={availableGatewayUrl}
  />
)

export default connect(
  'selectToursEnabled',
  'selectAvailableGatewayUrl',
  withTour(ExploreContainer)
)
