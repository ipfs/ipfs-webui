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
      adding: false
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

  onFileChange: function(e) {
    var files = e.target.files
    if(!files || !files[0]) return
    var file = files[0]
    var t = this
    console.log('adding file: ', file)

    function add(data) {
      t.props.ipfs.add(data, function(err, res) {
        if(err || !res) return t.error(err)

        var metadata = {
          id: res.Objects[0].Hash,
          name: res.Names[0] || file.name,
          type: file.type,
          size: file.size
        }

        var nextFiles = (t.state.files || []).concat([metadata])
        localStorage.files = JSON.stringify(nextFiles)
        t.setState({ files: nextFiles, adding: false })
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
    //  TODO: add file view to show content of selected file
    
    return (
  <div className="row">
    <div className="col-sm-10 col-sm-offset-1">
      <div className="actions">
        <button className="btn btn-link add-file" style={{display: this.state.adding ? 'none' : 'inline'}} onClick={this.addFile}>
          <strong><i className="fa fa-plus-circle"></i> Add a file</strong>
        </button>
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
