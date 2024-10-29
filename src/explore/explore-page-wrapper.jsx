import React from 'react'
import { HeliaProvider, ExploreProvider } from 'ipld-explorer-components/providers'
import ExplorePageRenderer from './explore-page-renderer'
import 'ipld-explorer-components/css'

export const ExplorePageWrapper = () => {
  return (
    <HeliaProvider>
      <ExploreProvider>
        <ExplorePageRenderer />
      </ExploreProvider>
    </HeliaProvider>
  )
}

export default ExplorePageWrapper
