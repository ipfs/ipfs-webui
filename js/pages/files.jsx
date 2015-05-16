var React = require('react')
var FileList = require('../views/filelist.jsx')
var LocalStorage = require('../utils/localStorage')
var $ = require('jquery')

var Files = React.createClass({
  displayName: 'Files',
  propTypes: {
    ipfs: React.PropTypes.object,
    gateway: React.PropTypes.string
  },
  getInitialState: function () {
    var t = this

    var files = LocalStorage.get('files') || []

    function getFiles () {
      t.props.ipfs.pin.list(function (err, pinned) {
        if (err || !pinned) return t.error(err)
        t.setState({ pinned: Object.keys(pinned.Keys).sort() })
      })

      t.props.ipfs.pin.list('recursive', function (err, pinned) {
        if (err || !pinned) return t.error(err)
        t.setState({ local: Object.keys(pinned.Keys).sort() })
      })
    }

    getFiles()

    return {
      files: files,
      pinned: [],
      local: [],
      dragging: false
    }
  },

  componentWillUnmount: function () {
    clearInterval(this.pollInterval)
  },

  addFile: function (e) {
    e.preventDefault()
    $(this.getDOMNode()).find('.file-select').click()
    return
  },

  onDragOver: function (e) {
    console.log('dragover')
    this.setState({ dragging: true })
    $(e.target).addClass('hover')
    e.stopPropagation()
    e.preventDefault()
  },

  onDragLeave: function (e) {
    console.log('dragleave')
    this.setState({ dragging: false })
    $(e.target).removeClass('hover')
    e.stopPropagation()
    e.preventDefault()
  },

  onDrop: function (e) {
    this.setState({ dragging: false })
    $(e.target).removeClass('hover')
    e.stopPropagation()
    e.preventDefault()
    this.onFileChange(e)
  },

  onFileChange: function (e) {
    var files = e.target.files || e.dataTransfer.files
    if (!files || !files[0]) return
    var file = files[0]
    var t = this
    console.log('adding file: ', file)

    function add (data) {
      t.props.ipfs.add(data, function (err, res) {
        if (err || !res) return t.error(err)
        res = res[0]

        var metadata = {
          id: res.Hash,
          name: res.Name || file.name,
          type: file.type,
          size: file.size
        }

        var nextFiles = (t.state.files || [])
        nextFiles.unshift(metadata)
        LocalStorage.set('files', nextFiles)
        t.setState({
          files: nextFiles,
          confirm: metadata.name
        })

        setTimeout(function () {
          t.setState({ confirm: null })
        }, 6000)
      })
    }

    if (file.path) {
      add(file.path)

    } else {
      var reader = new window.FileReader()
      reader.onload = function () {
        var data = reader.result
        data = new Buffer(data.substr(data.indexOf(',') + 1), 'base64')
        add(data)
      }
      // TODO: use array buffers instead of base64 strings
      reader.readAsDataURL(file)
    }
  },

  error: function (err) {
    console.error(err)
    // TODO
  },

  render: function () {
    var tab = window.location.hash.split('/')
    tab = tab.length >= 3 ? tab[2] : tab[1]

    return (
  <div className='row'>
    <div className='col-sm-10 col-sm-offset-1'>
      <ul className='nav nav-tabs'>
        <li role='presentation' className={tab === 'files' ? 'active' : ''}><a href='#/files'>Files</a></li>
        <li role='presentation' className={tab === 'pinned' ? 'active' : ''}><a href='#/files/pinned'>Pinned</a></li>
        <li role='presentation' className={tab === 'all' ? 'active' : ''}><a href='#/files/all'>All</a></li>
      </ul>

      <div className={tab !== 'files' ? 'hidden' : ''}>
        <div className='file-add-container'>
          <div className='file-add-target' onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}></div>
          <div className={'file-add-container-inner ' + (this.state.dragging ? 'hover' : '')}></div>
          <div className={(this.state.dragging || this.state.confirm) ? 'hidden' : ''}>
            <p><strong>Drag-and-drop your files here</strong></p>
            <p><span>or</span></p>
            <p>
              <button className='btn btn-second add-file' onClick={this.addFile} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}>
                Select files...
              </button>
            </p>
          </div>
          <div className={!this.state.dragging ? 'hidden' : ''}>
            <p><strong>Drop your file here to add it to IPFS</strong></p>
          </div>
          <div className={!this.state.confirm ? 'hidden' : ''}>
            <p><i className='fa fa-lg fa-thumbs-up'></i> Added <strong>{this.state.confirm}</strong></p>
          </div>
          <input type='file' className='file-select' style={{display: 'none'}} onChange={this.onFileChange}/>
        </div>
        <br/>

        <div className='panel panel-default'>
          <FileList files={this.state.files} ipfs={this.props.ipfs} gateway={this.props.gateway} />
        </div>
      </div>

      <div className={tab !== 'pinned' ? 'hidden' : ''}>
        <h3>Pinned Files</h3>
        <div className='panel panel-default'>
          <FileList files={this.state.pinned} namesHidden={true} ipfs={this.props.ipfs} gateway={this.props.gateway} />
        </div>
      </div>

      <div className={tab !== 'all' ? 'hidden' : ''}>
        <h3>All Local Files</h3>
        <div className='panel panel-default'>
          <FileList files={this.state.local} namesHidden={true} ipfs={this.props.ipfs} gateway={this.props.gateway} />
        </div>
      </div>
    </div>
  </div>
    )
  }
})

module.exports = Files
