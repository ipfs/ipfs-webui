import React, {Component, PropTypes} from 'react'
import {last} from 'lodash-es'
import {connect} from 'react-redux'
import {Row, Col} from 'react-bootstrap'

import {pages} from '../actions'

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
    load: PropTypes.func.isRequired
  };

  componentWillMount () {
    this.props.load()
  }

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
      <Row>
        <Col sm={10} smOffset={1}>
          <h3>Preview of {file}</h3>
          {preview}
        </Col>
      </Row>
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
  load: pages.preview.load
})(FilesPreview)
