import React from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components'
import withTour from '../components/tour/withTour'

const ExploreContainer = ({
  toursEnabled,
  handleJoyrideCallback,
  gatewayUrl
}) => (
  <ExplorePage
    runTour={toursEnabled}
    joyrideCallback={handleJoyrideCallback}
    gatewayUrl={gatewayUrl}
  />
)

export default connect(
  'selectToursEnabled',
  'selectGatewayUrl',
  withTour(ExploreContainer)
)
