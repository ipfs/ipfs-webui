import React from 'react'
import './Loader.css'

export const Loader = props => {
  return (
    <div {...props}>
      <div
        className='la-ball-triangle-path la-light la-sm'
        style={{width: 20, height: 20}}>
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}
