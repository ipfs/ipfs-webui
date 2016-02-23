import React, {Component, PropTypes} from 'react'
import {map, isEqual} from 'lodash'
import WorldMap from './world-map'

export default class World extends Component {
  static propTypes = {
    peersCount: PropTypes.number,
    locations: PropTypes.object
  };

  static defaultProps = {
    peersCount: 0,
    locations: {}
  };

  shouldComponentUpdate (nextProps) {
    return !isEqual(nextProps, this.props)
  }

  render () {
    const coordinates = map(this.props.locations, ({lon, lat}) => {
      return [lon, lat]
    })

    return (
      <div className='world'>
        <WorldMap coordinates={coordinates}/>
        <div className='world-peers-counter'>
          <div className='counter'>{this.props.peersCount}</div>
          <div className='label'>Peers</div>
        </div>
      </div>
    )
  }
}
