import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Box from '../components/box/Box'
import JsonEditor from './editor/JsonEditor'

class SettingsPage extends React.Component {
  render () {
    const {config} = this.props
    return (
      <div data-id='SettingsPage'>
        <Helmet>
          <title>Settings - IPFS</title>
        </Helmet>
        <Box>
          <p className='ma0 pb4 lh-copy teal-muted f6 mw7'>
            The go-ipfs config file is a json document. It is read once at node instantiation, either for an offline command, or when starting the daemon. Commands that execute on a running daemon do not read the config file at runtime.
          </p>
          <JsonEditor value={config} />
        </Box>
      </div>
    )
  }
}

export default connect('selectConfig', SettingsPage)
