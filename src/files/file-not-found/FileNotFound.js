import React from 'react'

import Button from '../../components/button/button'

import GlyphAttention from '../../icons/GlyphAttention.js'

const FileNotFound = ({ path }) => {
  return (
    <div
      className='mb3 pa4-l pa2 mw9 center'
      style={{ background: 'rgba(251, 251, 251)' }}
    >
      <div className='flex flex-row items-center mb3'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <div className='red fw6 truncate'>IPFS can't find this item</div>
      </div>
      <div className='mb3 charcoal fw6 truncate'>{path}</div>
      <div className='mb3'>These are common troubleshooting steps might help:</div>
      <ul>
        <li>Are there typos in the path you entered?</li>
        <li>Was the file moved, renamed, or deleted?</li>
        <li>Did you copy a URL or bookmark from another computer? If so, you'll need to <a href="#/peers">point this instance at that computer's node</a>.</li>
      </ul>
      <a href="#/files">
        <Button className='ma2 tc' bg='bg-teal'>Go to Home</Button>
      </a>
    </div>
  )
}

export { FileNotFound }
