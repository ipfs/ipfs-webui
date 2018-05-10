import React from 'react'
import { connect } from 'redux-bundler-react'

export function IpldPage ({routeParams}) {
  return (
    <div>
      <h1 data-id='title'>IPLD</h1>
      <h2>{routeParams.path}</h2>
    </div>
  )
}

export default connect('selectRouteParams', IpldPage)
