import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import {pages, router} from '../actions'
import Icon from '../views/icon'

function getExtension (name) {
  name = name.toLowerCase()

  const i = name.lastIndexOf('.')
  return name.substring(i + 1)
}

class FilesPreview extends Component {
  static propTypes = {
    // state
    name: PropTypes.string.isRequired,
    preview: PropTypes.shape({
      name: PropTypes.string.isRequired,
      content: PropTypes.instanceOf(Buffer).isRequired
    }),
    // actions
    readFile: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  };

  componentWillMount () {
    this.props.load()
  }

  _onClose = (event) => {
    event.preventDefault()

    this.props.goBack()
  };

  _preview () {
    if (!this.props.preview) return
    const {preview} = this.props
    const ext = getExtension(preview.name)
    const blob = new Blob([preview.content], {type: `image/${ext}`})
    const urlCreator = window.URL || window.webkitURL
    const imageUrl = urlCreator.createObjectURL(blob)

    return (
      <img
        alt={preview.name}
        src={imageUrl}/>
    )
  }

  render () {
    const file = this.props.name
    const preview = this._preview()
    return (
      <div className='files-preview'>
        <div className='files-preview-header'>
          <h3>{file}</h3>
          <a onClick={this._onClose} className='close'>
            <Icon glyph='close' />
          </a>
        </div>
        <div className='files-preview-area'>
          {preview}
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
  goBack: router.goBack
})(FilesPreview)
