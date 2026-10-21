import React, { useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import LoadableExplorePage from './LoadableExplorePage'
import LoadableStartExploringPage from './LoadableStartExploringPage'
import { useExplore, useHelia } from 'ipld-explorer-components/providers'
import 'ipld-explorer-components/css'

const ExplorePageRenderer = ({ routeInfo }) => {
  const { pattern, url } = routeInfo
  const { setExplorePath } = useExplore()
  const { doInitHelia, helia } = useHelia()

  useEffect(() => {
    if (helia == null) {
      doInitHelia()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helia])

  useEffect(() => {
    setExplorePath(window.location.hash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return (
    // NOTE: ipld-explorer-components does not ship its own dark theme yet, but the
    // global Tachyons/IPFS-CSS dark overrides in src/index.css cover all classes
    // used by the library sufficiently. If theming regressions appear here after an
    // ipld-explorer-components upgrade, targeted overrides can be added to the
    // .explore-page-container block in index.css.
    // See: https://github.com/ipfs-shipyard/ipfs-webui/issues/1702
    <div className='explore-page-container'>
      {pattern === '/explore' ? <LoadableStartExploringPage /> : <LoadableExplorePage />}
    </div>
  )
}

export default connect(
  'selectRouteInfo',
  ExplorePageRenderer
)
