var React = require('react')
var Nav = require('../views/nav.jsx')
var FileList = require('../views/filelist.jsx')

module.exports = React.createClass({
  getInitialState: function() {
    var files = JSON.parse(localStorage.files || '[]')

    return {
      files: files,
      adding: false
    }
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
    console.log('adding file: ', file)
    console.log(this.props.ipfs)

    var reader = new FileReader
    reader.onload = function() {
      var data = reader.result
      data = new window.Buffer(data.substr(data.indexOf(',') + 1), 'base64')

      console.log('data: ', data)

      this.props.ipfs.add(data, function(err, res) {
        console.log('ipfs.add: ', err, res)
        if(err || !res) return this.error(err)

        res = res.toString()
        console.log(res)

        if(res.indexOf('addFile error:') === 0) return this.error(res)

        file.id = res.split(' ')[1].trim()
        var metadata = {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size
        }

        var nextFiles = this.state.files.concat([metadata])
        localStorage.files = JSON.stringify(nextFiles)
        this.setState({ files: nextFiles, adding: false })
      }.bind(this))
    }.bind(this)
    // TODO: use array buffers instead of base64 strings
    reader.readAsDataURL(file)
  },

  onFileClick: function(e) {
    var el = $(e.target)
    while(!el.hasClass('webui-file')) el = el.parent()
    var id = el.find('.webui-address').text(),
        type = el.attr('data-type')

    console.log('clicked', id, type)

    this.props.ipfs.cat(id, function(err, res) {
      if(err) return this.error(err)
      // TODO: show file in iframe instead of navigating
      window.location = 'data:' + type + ';base64,' + res.toString('base64')
    }.bind(this))
  },

  error: function(err) {
    console.error(err)
    // TODO
  },

  render: function() {
    //  TODO: add file view to show content of selected file
    
    return (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <Nav activeKey={3} />

      <div className="actions">
        <button className="btn btn-link add-file" style={{display: this.state.adding ? 'none' : 'inline'}} onClick={this.addFile}>
          <strong><i className="fa fa-plus-circle"></i> Add a file</strong>
        </button>
        <input type="file" className="file-select" style={{display: !this.state.adding ? 'none' : 'inline'}} onChange={this.onFileChange}/>
      </div>
      <br/>

      <div className="panel panel-default">
        {FileList({
          files: this.state.files,
          click: this.onFileClick
        })}
      </div>
    </div>
  </div>
    )
  }
})
