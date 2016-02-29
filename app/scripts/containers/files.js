import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'

import Explorer from '../components/files/explorer'
import {loadFilesPage, leaveFilesPage, filesSetRoot} from '../actions'

class Files extends Component {
  static propTypes = {
    loadFilesPage: PropTypes.func.isRequired,
    leaveFilesPage: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired,
    filesSetRoot: PropTypes.func.isRequired
  };

  componentWillMount () {
    this.props.loadFilesPage()
  }

  componentWillUnmount () {
    this.props.leaveFilesPage()
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <Explorer
            files={this.props.files}
            root={this.props.root}
            setRoot={this.props.filesSetRoot}/>
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  const {files} = state

  return {
    files: files.list,
    root: files.root
  }
}

export default connect(mapStateToProps, {
  loadFilesPage,
  leaveFilesPage,
  filesSetRoot
})(Files)
