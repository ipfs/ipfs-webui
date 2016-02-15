import React, {Component, PropTypes} from 'react'
import ColorHash from 'color-hash'

const colorHash = new ColorHash()
export default class ColorBlock extends Component {
  static propTypes = {
    source: PropTypes.string,
    color: PropTypes.string
  };

  _getColor () {
    if (this.props.color) return this.props.color
    return colorHash.hex(this.props.source)
  }

  render () {
    const style = {
      display: 'block',
      width: '10px',
      height: '10px',
      flex: '0 0 10px',
      backgroundColor: this._getColor()
    }
    return <span style={style} className='color-block'></span>
  }
}
