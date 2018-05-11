import React from 'react'
import './Loader.css'

export const Loader = props => {
  return (
    <div
      className='la-ball-triangle-path la-light la-sm'
      style={{width: 20, height: 20}}
      {...props}>
      <div />
      <div />
      <div />
    </div>
  )
}
