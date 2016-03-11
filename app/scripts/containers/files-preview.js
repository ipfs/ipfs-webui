import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {pages, router} from '../actions'
import Icon from '../views/icon'
import Preview from '../components/preview'

class FilesPreview extends Component {
  static propTypes = {
    // state
    name: PropTypes.string.isRequired,
    preview: PropTypes.shape({
      name: PropTypes.string.isRequired,
      content: PropTypes.instanceOf(Buffer).isRequired,
      stats: PropTypes.object
    }),
    // actions
    load: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  };

  componentWillMount () {
    this.props.load()
  }

  componentWillUnmount () {
    this.props.leave()
  }

  _onClose = (event) => {
    event.preventDefault()

    this.props.goBack()
  };

  render () {
    const {name} = this.props
    const content = this.props.preview ? this.props.preview.content : null
    const stats = this.props.preview ? this.props.preview.stats : {}

    return (
      <div className='files-preview'>
        <div className='files-preview-header'>
          <h3>{name}</h3>
          <a onClick={this._onClose} className='close'>
            <Icon glyph='close' />
          </a>
        </div>
        <div className='files-preview-area'>
          <Preview name={name} content={content} stats={stats}/>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  return {
    name: ownProps.location.query.name,
    preview: state.files.preview
  }
}

export default connect(mapStateToProps, {
  load: pages.preview.load,
  leave: pages.preview.leave,
  goBack: router.goBack
})(FilesPreview)
