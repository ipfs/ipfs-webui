import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'

import ObjectInfo from './ObjectInfo'

// Sample DagNode info
// (await ipfs.object.get('QmQPXjxdsxM7PKp1HVZ3oAXVKLSXoZXFG5CY1evPe4UGCB')).toJSON()
import dagNodeA from './fixtures/object-info-8-links.json'
import dagNodeB from './fixtures/object-info-36-links.json'
import dagNodeC from './fixtures/object-info-1240-links.json'

storiesOf('IPLD Node Info', module)
  .addDecorator(checkA11y)
  .add('cid v0 dag-pb', () => (
    <ObjectInfo
      className='ma2'
      cid={dagNodeA.multihash}
      size={dagNodeA.size}
      links={dagNodeA.links}
      data='{"type":"directory","blockSizes":[]}'
      type='MerkleDAG Protobuf' />
  ))
  .add('cid v0 dag-pb 36 links...', () => (
    <ObjectInfo
      className='ma2'
      cid={dagNodeB.multihash}
      size={dagNodeB.size}
      links={dagNodeB.links}
      data='{"type":"directory","blockSizes":[]}'
      type='MerkleDAG Protobuf' />
  ))
  .add('cid v0 dag-pb 1240 links...', () => (
    <ObjectInfo
      className='ma2'
      cid={dagNodeC.multihash}
      size={dagNodeC.size}
      links={dagNodeC.links}
      data='{"type":"directory","blockSizes":[]}'
      type='MerkleDAG Protobuf' />
  ))
