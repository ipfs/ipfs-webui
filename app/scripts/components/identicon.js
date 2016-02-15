import React, {Component, PropTypes} from 'react'
import IdenticonJS from 'imports?window=>{}&PNGlib=pnglib!exports?window.Identicon!identicon.js'
import md5 from 'md5'

export default class Identicon extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    size: PropTypes.number
  };

  static defaultProps = {
    size: 20
  };

  render () {
    const {id, size} = this.props
    const data = new IdenticonJS(md5(id), size, 0.02)

    return (
      <img
        className='identicon'
        width={size}
        height={size}
        src={`data:image/png;base64,${data}`}/>
    )
  }
}
