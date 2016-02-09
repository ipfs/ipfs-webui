import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import {Button} from 'react-bootstrap'

export default class LogController extends Component {
  static propTypes = {
    systems: PropTypes.array.isRequired,
    selectedSystem: PropTypes.string.isRequired,
    tail: PropTypes.bool.isRequired,
    toggleTail: PropTypes.func.isRequired,
    selectLogSystem: PropTypes.func.isRequired
  };

  _onSystemChange = (val) => {
    let system = ''
    if (val && val.value) {
      system = val.value
    }

    this.props.selectLogSystem(system)
  };

  render () {
    const systems = this.props.systems.map((system) => {
      return {
        value: system,
        label: system
      }
    })

    return (
      <div className='log-controller'>
        <Select
          name='systems'
          className='systems-select'
          value={this.props.selectedSystem}
          options={systems}
          onChange={this._onSystemChange}
        />
        <Button
          bsStyle='info'
          bsSize='small'
          className='tail-button'
          active={this.props.tail}
          onClick={this.props.toggleTail}
        >
          Tail Log
        </Button>
      </div>
    )
  }
}
