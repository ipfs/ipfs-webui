import React from 'react'
import Box from '../components/box/Box.js'
import {Loader} from './Loader'

class ComponentLoader extends React.Component {
  render () {
    const {pastDelay} = this.props
    return pastDelay ? (
      <Box style={{height: '100%'}}>
        <div style={{height: '100%'}}>
          <Loader color='dark' />
        </div>
      </Box>
    ) : null
  }
}

export default ComponentLoader
