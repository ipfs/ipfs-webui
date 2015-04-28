var React = require('react')
var FileList = require('../views/filelist.jsx')
var LocalStorage = require('../utils/localStorage')
var _ = require('lodash')
var $ = require('jquery')

var Files = React.createClass({
  getInitialState: function () {

    this.getFiles()

    return {
      files: [],
      dragging: false
    }
  },

  getFiles: function  () {
    var t = this

    t.props.ipfs.pin.list('recursive', function (err, pinned) {
      t.props.ipfs.ls(_.keys(pinned.Keys), function (err, nodes) {
        _.forEach(nodes.Objects, function (node) {
          var newfiles = {}
          _.forEach(node.Links, function (link) {
            if (link.Name) {
              newfiles[link.Hash] = link
            }
            t.setState({ files: _.merge(t.state.files, newfiles)})
          })
        })
      })
    })
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

        // TODO make size part of return for add request?
        t.props.ipfs.object.stat(res.Hash, function (err, stat) {
          if (err || !res) return t.error(err)

          var wrap = new Buffer(JSON.stringify({
            Data: "\b\u0001", // TODO, maybe not use hard-coded unixfs protobuf
            Links: [
              {
                Hash: res.Hash,
                Name: file.name,
                Size: stat.CumulativeSize
              }
            ]}))

          t.props.ipfs.object.put(wrap, "json", function (err, res) {
            if (err || !res) return t.error(err)

            // recursively pin the wrapping directory
            t.props.ipfs.pin.add(res.Hash, {"recursive": true}, function (err, res) {
              if (err || !res) return t.error(err)

              // success
              t.setState({
                confirm: file.Name || file.name
              })

              setTimeout(function () {
                t.setState({ confirm: null })
              }, 6000)

              t.getFiles()
            })
          })
        })
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
  <div className="row">
    <div className="col-sm-10 col-sm-offset-1">
      <div className={tab !== 'files' ? 'hidden' : ''}>
        <div className="file-add-container">
          <div className="file-add-target" onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}></div>
          <div className={'file-add-container-inner ' + (this.state.dragging ? 'hover' : '')}></div>
          <div className={(this.state.dragging || this.state.confirm) ? 'hidden' : ''}>
            <p><strong>Drag-and-drop your files here</strong></p>
            <p><span>or</span></p>
            <p>
              <button className="btn btn-second add-file" onClick={this.addFile} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop}>
                Select files...
              </button>
            </p>
          </div>
          <div className={!this.state.dragging ? 'hidden' : ''}>
            <p><strong>Drop your file here to add it to IPFS</strong></p>
          </div>
          <div className={!this.state.confirm ? 'hidden' : ''}>
            <p><i className="fa fa-lg fa-thumbs-up"></i> Added <strong>{this.state.confirm}</strong></p>
          </div>
          <input type="file" className="file-select" style={{display: 'none'}} onChange={this.onFileChange}/>
        </div>
        <br/>

        <div className="panel panel-default">
          <FileList files={_.values(this.state.files)} ipfs={this.props.ipfs} gateway={this.props.gateway} />
        </div>
      </div>
    </div>
  </div>
    )
  }
})

module.exports = Files
