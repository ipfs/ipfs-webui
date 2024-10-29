import React, { useEffect } from 'react'
import { connect } from 'redux-bundler-react'
import LoadableExplorePage from './LoadableExplorePage'
import LoadableStartExploringPage from './LoadableStartExploringPage'
import { useExplore } from 'ipld-explorer-components/providers'

const ExplorePageRenderer = ({ routeInfo }) => {
  const { pattern, url } = routeInfo
  const exploreStuff = useExplore()
  // const ref = useRef()
  console.log('exploreStuff', exploreStuff)

  useEffect(() => {
    /**
     * emit a fake 'hashchange' event when `routeInfo.url` changes
     * because ipld-explorer-components depends on hashchange events
     * @see https://github.com/ipfs/ipld-explorer-components/issues/455
     */
    window.dispatchEvent(new Event('hashchange'))
  }, [url])

  if (pattern === '/explore') {
    return <LoadableStartExploringPage />
  }

  return <LoadableExplorePage />
}

export default connect(
  'selectRouteInfo',
  ExplorePageRenderer
)
