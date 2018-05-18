import React from 'react'
import { storiesOf } from '@storybook/react'
import { checkA11y } from '@storybook/addon-a11y'

import NodeInfo from './NodeInfo'

const links = [{'name': 'contact-ipfs', 'size': 5814, 'multihash': 'QmXdUm5xgmmFK5ykH3Yvk2PFtL9eDs4FGJ9wpScXUMVsU1'}, {'name': 'css', 'size': 42684, 'multihash': 'QmRNaib6Pz2PUVLpEbMkEdETu5cup77Dtkief58o4NRPaM'}, {'name': 'docs', 'size': 6750964, 'multihash': 'QmSNmHbujerGN3ZmtXdkUY1MoRhULFQztV4tRWpXW8pjkV'}, {'name': 'fonts', 'size': 914365, 'multihash': 'QmX7GQcyrVaKnS24y6nvU4LEB9hkcK5TkxoxRBaGFUUD6Q'}, {'name': 'images', 'size': 1509477, 'multihash': 'QmZMWv34NMLbhBxWysqViFdiMkGf4WtfXc5GQDnV8NWo5J'}, {'name': 'index.html', 'size': 17069, 'multihash': 'Qme8Kh3QbmeBjDZEVTmL6NEf8AWQZr6vyBpoxqC3WwmScc'}, {'name': 'js', 'size': 755010, 'multihash': 'QmSGnYkR3jJFPfooK7HZbam4418fpSRsCbtLpxMeikciTS'}, {'name': 'legal', 'size': 5726, 'multihash': 'QmaXsRWbBAxTF7Z4SrScHitj4CvjyCcnCjqXwBLgnkpP5W'}, {'name': 'media', 'size': 12900, 'multihash': 'QmYMe5tKxTQdyNL7Vs9QtehBTci6F1CDYYkeo9wFdoVSE7'}, {'name': 'sitemap.xml', 'size': 2202, 'multihash': 'QmbBZGoTh58At3D5uvr5HzCqRtPp39rZeydtPE2isW3gEq'}]

storiesOf('IPLD Node Info', module)
  .addDecorator(checkA11y)
  .add('cid v0 dag-pb', () => (
    <NodeInfo
      className='ma2'
      size='10016715'
      links={links}
      type='MerkleDAG Protobuf'
      cid='QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW' />
  ))
