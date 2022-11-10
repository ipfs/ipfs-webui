import React from 'react'
import { connect } from 'redux-bundler-react'
import StartSearchingPage from './StartSearchingPage'
import withTour from '../components/tour/withTour'

const StartSearchingContainer = ({
  toursEnabled,
  handleJoyrideCallback
}) => (
  <StartSearchingPage
    runTour={toursEnabled}
    joyrideCallback={handleJoyrideCallback} />
)

export default connect(
  'selectToursEnabled',
  withTour(StartSearchingContainer)
)
