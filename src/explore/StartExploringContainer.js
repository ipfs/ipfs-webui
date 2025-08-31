import React from 'react'
import { StartExploringPage } from 'ipld-explorer-components/pages'
import { useTours } from '../contexts/tours-context.js'

const StartExploringContainer = () => {
  const { enabled, handleJoyrideCallback } = useTours()
  return (
    <StartExploringPage
      runTour={enabled}
      joyrideCallback={handleJoyrideCallback} />
  )
}

export default StartExploringContainer
