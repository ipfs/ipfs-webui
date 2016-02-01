import React from 'react'
import {Row, Col, Modal, Button, Input} from 'react-bootstrap'
import debug from 'debug'
import {join} from 'path'
import map from 'map-async'
import _ from 'lodash'
import bl from 'bl'
import Markdown from 'react-remarkable'

import FilesExplorer from '../components/files-explorer'
import Icon from '../views/icon'
import RawData from '../views/object/raw-data'

const log = debug('pages:files')
log.error = debug('pages:files:error')

function isDirectory ({Type}) {
  return Type === 'directory'
}

const extensions = {
  markdown: ['md', 'markdown'],
  image: ['png', 'jpg', 'jpeg', 'gif']
}

function getExtension (name) {
  name = name.toLowerCase()

  const i = name.lastIndexOf('.')
  return name.substring(i + 1)
}

function getRenderer (ext) {
  return _.findKey(extensions, elem => {
    return _.includes(elem, ext)
  })
}

const renderers = {
  markdown (name, ext, data) {
    return <Markdown source={data.toString()} />
  },
  image (name, ext, data) {
    const blob = new Blob([data], {type: `image/${ext}`})
    const urlCreator = window.URL || window.webkitURL
    const imageUrl = urlCreator.createObjectURL(blob)
    // `data:image;${ext};base64,${data.toString('base64')}`
    return (
      <img
          src={imageUrl}
          style={{overflow: 'auto', width: '100%', height: '100%'}}
      />
    )
  }
}

function FileRenderer ({name, data}) {
  if (!name || !data) return null

  const ext = getExtension(name)
  const renderer = getRenderer(ext)

  if (renderers[renderer]) return renderers[renderer](name, ext, data)

  return <RawData data={data.toString()} />
}

export default class Files extends React.Component {
  static displayName = 'Files';

  static propTypes = {
    ipfs: React.PropTypes.object
  };

  state = {
    files: [],
    root: '/',
    showModalFolder: false,
    showModalFile: false,
    file: {}
  };

  onRowClick = file => {
    if (isDirectory(file)) {
      this.setRoot(join(this.state.root, file.Name))
    } else {
      const filePath = join(this.state.root, file.Name)
      this.props.ipfs.files.read(filePath, (err, stream) => {
        if (err) return log.error(err)

        stream.pipe(bl((err, data) => {
          if (err) return log.error(err)

          this.setState({
            showModalFile: true,
            file: {
              ...file,
              Data: data
            }
          })
        }))
      })
    }
  };

  onParentClick = root => {
    this.setRoot(root)
  };

  onFolderAdd = name => {
    this.props.ipfs.files.mkdir(name, err => {
      if (err) return log.error(err)
      this.getFiles()
    })
  };

  onModalHide = () => {
    this.setState({showModalFolder: false})
    const folderName = this.refs.modalInput.refs.input.value

    if (_.isEmpty(folderName)) return log.error('Can not create empty folder')
    this.onFolderAdd(join(this.state.root, folderName))
  };

  setRoot (newRoot) {
    if (newRoot === '.') newRoot = '/'
    this.setState({root: newRoot}, () => this.getFiles())
  }

  getFiles () {
    const {ipfs} = this.props
    const {root} = this.state

    ipfs.files.ls(root, (err, result) => {
      if (err || !result) return log.error(err)
      const files = _.sortBy(result.Entries, 'Name') || []

      map(
        files,
        (file, done) => {
          ipfs.files.stat(join(root, file.Name), (err, stats) => {
            if (err) return done(err)
            done(null, Object.assign({}, file, stats))
          })
        },
        (err, stats) => {
          if (err) return log.error(err)
          this.setState({
            files: stats
          })
        })
    })
  }

  componentDidMount () {
    this.getFiles()

    this.setState({fetchIntervall: setInterval(() => this.getFiles(), 5000)})
  }

  componentWillUnmount () {
    clearInterval(this.state.fetchIntervall)
  }

  render () {
    const parts = {}
    const partsList = _.compact(this.state.root.split('/'))
    partsList.map((part, i) => {
      if (i === partsList.length - 1) {
        parts[part] = null
      } else {
        parts[part] = '/' + partsList.slice(0, i + 1).join('/')
      }
    })

    const breadcrumbs = _(parts)
      .map((root, part) => {
        if (!root) {
          return [
            <Icon key='last-0' glyph='angle-right' />,
            <span key='last-1'>{part}</span>
          ]
        }

        return [
          <Icon key={`${root}-0`} glyph='angle-right' />,
          <a
              key={`${root}-1`}
              onClick={this.onParentClick.bind(this, root)}
              className='crumb-link'>
            {part}
          </a>
        ]
      })
      .flatten()
      .value()

    if (_.isEmpty(partsList)) {
      breadcrumbs.unshift(
        <span key='-1'>IPFS</span>
      )
    } else {
      breadcrumbs.unshift(
          <a
              key='-1'
              onClick={this.onParentClick.bind(null, '/')}
              className='crumb-link'>
            IPFS
          </a>
      )
    }
    return (
      <div>
        <Row>
          <Col sm={10} smOffset={1}>
            <Row>
              <Col sm={8} className='breadcrumbs'>
                {breadcrumbs}
              </Col>
              <Col sm={4} className='actions'>
                <a onClick={() => this.setState({showModalFolder: true})}>
                  <Icon glyph='plus'/> Add Directory
                </a>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <FilesExplorer
                    files={this.state.files}
                    onRowClick={this.onRowClick} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Modal
            show={this.state.showModalFolder}
            onHide={() => this.setState({showModalFolder: false})}>
          <Modal.Header closeButton>
            <Modal.Title>Add Directory to {this.state.root}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input type='text' ref='modalInput' />
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle='primary' onClick={this.onModalHide}>Add</Button>
          </Modal.Footer>
        </Modal>
        <Modal
            bsSize='large'
            dialogClassName='modal-file-content'
            show={this.state.showModalFile}
            onHide={() => this.setState({showModalFile: false})}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.file.Name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FileRenderer
                name={this.state.file.Name}
                data={this.state.file.Data} />
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}
