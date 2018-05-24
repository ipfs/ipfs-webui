import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import IpldGraph from './IpldGraph'
import IpldGraphCytoscape from './IpldGraphCytoscape'

import dagNodeA from '../object-info/fixtures/object-info-8-links.json'
import dagNodeB from '../object-info/fixtures/object-info-36-links.json'
// import dagNodeC from '../object-info/fixtures/object-info-1240-links.json'

storiesOf('IPLD Graph', module)
  .add('3 links', () => (
    <IpldGraph />
  ))
  .add('cytoscape 8 links', () => (
    <IpldGraphCytoscape
      style={{width: '50%', height: 500}}
      path={dagNodeA.multihash}
      links={dagNodeA.links}
      onNodeClick={action('node click')}
    />
  ))
  .add('cytoscape 36 links', () => (
    <IpldGraphCytoscape
      style={{width: '50%', height: 500}}
      path={dagNodeB.multihash}
      links={dagNodeB.links}
      onNodeClick={action('node click')} />
  ))
