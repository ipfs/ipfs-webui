import React from 'react'
import { connect } from 'redux-bundler-react'
import { StartExploringPage } from '../ipld-explorer'
import withTour from '../components/tour/withTour'

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
