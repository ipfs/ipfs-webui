import React from 'react'
import Box from '../box/Box.js'
import { Loader } from './Loader'

const ComponentLoader = ({ color = 'dark' }) => (
  <Box style={{ height: '100%' }} bg={'transparent'}>
    <div style={{ height: '100%' }}>
      <Loader color={color} />
    </div>
  </Box>
)

export default ComponentLoader
