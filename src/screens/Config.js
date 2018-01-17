import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { success, error } from '../utils/notification'

import {
  Pane,
  Header,
  Footer,
  IconButton,
  TextArea
} from 'ipfs-react-components'

export default class Config extends Component {
  state = {
    currentConfig: '',
    editing: '',
    error: null
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
    this.props.save(JSON.parse(this.state.editing))
      .then(() => { success('Configuration saved!') })
      .catch(error)
  }

  update = (value) => {
    const state = {
      editing: value
    }

    try {
      JSON.parse(value)
    } catch (error) {
      state.error = error.toString()
    }

    this.setState(state)
  }

  render () {
    return (
      <Pane>
        <Header title='Settings' />

        <div className='main'>
          { this.state.error !== null &&
            <p>{this.state.error}</p>
          }
          <TextArea value={this.state.editing} onChange={this.update} />
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
