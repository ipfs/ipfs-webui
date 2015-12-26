import React from 'react'
import ConfigView from '../views/config'

export default React.createClass({
  displayName: 'Config',
  propTypes: {
    ipfs: React.PropTypes.object
  },
  getInitialState: function () {
    this.props.ipfs.config.show((err, configStream) => {
      if (err) return console.log(err)

      this.setState({
        config: JSON.parse(configStream.toString())
      })
    })

    return { config: null }
  },

  render: function () {
    var config = this.state.config
      ? <ConfigView config={this.state.config} ipfs={this.props.ipfs} />
      : null

    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>
          {config}
        </div>
      </div>
    )
  }
})
