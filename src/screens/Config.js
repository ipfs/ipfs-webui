import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  Pane,
  Header,
  Footer,
  IconButton
} from 'ipfs-react-components'

export default class Config extends Component {
  state = {
    currentConfig: '',
    editing: ''
  }

  componentDidMount () {
    this.props.get().then((config) => {
      config = JSON.stringify(config, null, 4)
      this.setState({
        currentConfig: config,
        editing: config
      })
    })
  }

  reset = () => {
    this.setState({ editing: this.state.currentConfig })
  }

  save = () => {
    console.log(this.props.save(JSON.parse(this.state.editing)))
  }

  update = (event) => {
    this.setState({ editing: event.target.value })
  }

  render () {
    return (
      <Pane>
        <Header title='Settings' />

        <div className='main'>
          <textarea value={this.state.editing} onChange={this.update} />
        </div>

        <Footer>
          <div className='right'>
            <IconButton onClick={this.reset} icon='eraser' />
            <IconButton onClick={this.save} icon='save' />
          </div>
        </Footer>
      </Pane>
    )
  }
}

Config.propTypes = {
  get: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
}
