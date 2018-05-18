import React from 'react'
import PropTypes from 'prop-types'
import prettyBytes from 'pretty-bytes'
import Checkbox from '../../components/checkbox/Checkbox'
import StrokeFolder from '../../icons/StrokeFolder'
import StrokeDocument from  '../../icons/StrokeDocument'
import './File.css'

class File extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    hash: PropTypes.string.isRequired,
    status: PropTypes.number
  }

  static defaultProps = {
    status: null
  }

  state = {
    selected: false
  }

  changeSelectedState = (selected) => {
    this.setState({ selected: selected })
  }

  render () {
    let className = 'File flex bt'

    if (this.state.selected) {
      className += ' selected'
    }

    let status = null
    if (this.props.status !== null) {
      status = this.props.status + '%'
    }

    return (
      <div className={className}>
        <div className='pa2 w2'>
          <Checkbox onChange={this.changeSelectedState} />
        </div>
        <div className='name flex-grow-1 pa2 w-40'>
          {this.props.name}
        </div>
        <div className='status pa2 w-30'>{status}</div>
        <div className='size pa2 w-10'>{prettyBytes(this.props.size)}</div>
        <div className='pa2 w-10'>Peers</div>
      </div>
    ) 
  }
}

export default File
