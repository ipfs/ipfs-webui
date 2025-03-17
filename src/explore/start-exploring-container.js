import React from 'react'
import { connect } from 'redux-bundler-react'
import { StartExploringPage } from 'ipld-explorer-components/pages'
import withTour from '../components/tour/with-tour.js'

const StartExploringContainer = ({
  toursEnabled,
  handleJoyrideCallback
}) => (
  <StartExploringPage
    runTour={toursEnabled}
    joyrideCallback={handleJoyrideCallback} />
)

export default connect(
  'selectToursEnabled',
  withTour(StartExploringContainer)
)
