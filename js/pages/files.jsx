var React = require('react')
var Nav = require('../views/nav.jsx')
var FileList = require('../views/filelist.jsx')

module.exports = React.createClass({
  getInitialState: function() {
    var t = this

    var files = JSON.parse(localStorage.files || '[]')

    function getFiles() {
      t.props.ipfs.pin.list(function(err, pinned) {
        if(err || !pinned) return t.error(err)
        t.setState({ pinned: pinned.Keys.sort() })
      })

      t.props.ipfs.pin.list('recursive', function(err, pinned) {
        if(err || !pinned) return t.error(err)
        t.setState({ local: pinned.Keys.sort() })
      })
    }

    getFiles()
    t.props.pollInterval = setInterval(getFiles, 1000)

    return {
      files: files,
      pinned: [],
      local: [],
      adding: false,
      dragging: false
    }
  },

  componentWillUnmount: function() {
    clearInterval(this.props.pollInterval)
  },

  addFile: function(e) {
    e.preventDefault()

    var state = this.state
    if(state.adding) return

    state.adding = true
    this.setState(state)

    return
  },

  onDragOver: function(e) {
    if(!this.state.dragging) {
      this.setState({ dragging: true })
      $(e.target).addClass('hover')
    }
    e.stopPropagation()
    e.preventDefault()
  },

  onDragLeave: function(e) {
    if(this.state.dragging) {
      this.setState({ dragging: false })
      $(e.target).removeClass('hover')
    }
    e.stopPropagation()
    e.preventDefault()
  },
  
  onDrop: function(e) {
    this.setState({ dragging: false })
    $(e.target).removeClass('hover')
    e.stopPropagation()
    e.preventDefault()
    this.onFileChange(e)
  },
  
  onFileChange: function(e) {
    var files = e.target.files || e.dataTransfer.files
    if(!files || !files[0]) return
    var file = files[0]
    var t = this
    console.log('adding file: ', file)

    function add(data) {
      t.props.ipfs.add(data, function(err, res) {
        if(err || !res) return t.error(err)
        res = res[0]

        var metadata = {
          id: res.Hash,
          name: res.Name || file.name,
          type: file.type,
          size: file.size
        }

        var nextFiles = (t.state.files || []).concat([metadata])
        localStorage.files = JSON.stringify(nextFiles)
        t.setState({
          files: nextFiles,
          adding: false,
          confirm: metadata.name
        })

        setTimeout(function() {
          t.setState({ confirm: null })
        }, 6000)
      })
    }

    if(file.path) {
      add(file.path)

    } else {
      var reader = new FileReader
      reader.onload = function() {
        var data = reader.result
        data = new Buffer(data.substr(data.indexOf(',') + 1), 'base64')
        add(data)
      }.bind(this)
      // TODO: use array buffers instead of base64 strings
      reader.readAsDataURL(file)
    }
  },

  error: function(err) {
    console.error(err)
    // TODO
  },

  render: function() {
    return (
  <div className="row">
    <div className="col-sm-10 col-sm-offset-1">
      <div className="file-add-container" onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}>
        <div className={"file-add-container-inner "+(this.state.dragging ? "hover" : "")}></div>
        <div className={(this.state.dragging || this.state.confirm) ? "hidden" : ""}>
          <p><strong>Drag-and-drop your files here</strong></p>
          <p><span>or</span></p>
          <p>
            <button className="btn btn-second add-file" style={{display: this.state.adding ? 'none' : 'inline'}} onClick={this.addFile}>
              Select files...
            </button>
          </p>
        </div>
        <div className={!this.state.dragging ? "hidden" : ""}>
          <p><strong>Drop your file here to add it to IPFS</strong></p>
        </div>
        <div className={!this.state.confirm ? "hidden" : ""}>
          <p><i className="fa fa-lg fa-thumbs-up"></i> Added <strong>{this.state.confirm}</strong></p>
        </div>
        <input type="file" className="file-select" style={{display: !this.state.adding ? 'none' : 'inline'}} onChange={this.onFileChange}/>
      </div>
      <br/>

      <div className="panel panel-default">
        {FileList({ files: this.state.files })}
      </div>
      <br/>

      <h3>Pinned Files</h3>
      <div className="panel panel-default">
        {FileList({ files: this.state.pinned, namesHidden: true })}
      </div>
      <br />

      <h3>All Local Files</h3>
      <div className="panel panel-default">
        {FileList({ files: this.state.local, namesHidden: true })}
      </div>
    </div>
  </div>
    )
  }
})
