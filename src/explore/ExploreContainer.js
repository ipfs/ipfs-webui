import React, { useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import { ExplorePage } from 'ipld-explorer-components/pages'
import withTour from '../components/tour/withTour.js'
import { useHelia } from 'ipld-explorer-components/providers'

const ExploreContainer = ({
  toursEnabled,
  handleJoyrideCallback,
  availableGatewayUrl,
  publicGateway
}) => {
  const { doInitHelia } = useHelia()
  useEffect(() => {
    if (availableGatewayUrl === '' || availableGatewayUrl == null) return

    const { hostname, port, protocol } = new URL(availableGatewayUrl)
    doInitHelia({
      host: hostname,
      port,
      protocol: protocol.replace(':', '')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableGatewayUrl])
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
