import React from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components'
import withTour from '../components/tour/withTour'

const ExploreContainer = ({
  toursEnabled,
  handleJoyrideCallback
}) => (
  <ExplorePage
    runTour={toursEnabled}
    joyrideCallback={handleJoyrideCallback} />
)

export default connect(
  'selectToursEnabled',
  withTour(ExploreContainer)
)
