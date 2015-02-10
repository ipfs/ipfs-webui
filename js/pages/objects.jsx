var React = require('react')
var Router = require('react-router')
var Nav = require('../views/nav.jsx')
var Object = require('../views/object.jsx')

module.exports = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function() {
    console.log(this)
    var hash = (this.getParams().hash || '').replace(/[.]/g, '/')
    if(hash) this.getObject(hash)

    return { object: null, hash: hash }
  },

  handleLink: function(e) {
    e.preventDefault()
    e.stopPropagation()

    var target = $(e.target)
    if(!target.attr('data-name') && !target.attr('data-hash')) target = target.parent()
    var hash = target.attr('data-name')
    if(hash) hash = this.state.hash + '/' + hash
    else hash = target.attr('data-hash')
    this.setState({ hash: hash })
    this.getObject(hash)
  },

  handleBack: function(e) {
    var hash = this.state.hash
    var slashIndex = hash.lastIndexOf('/')
    if(slashIndex === -1) return
    hash = hash.substr(0, slashIndex)
    this.setState({ hash: hash })
    this.getObject(hash)
  },

  getObject: function(path) {
    console.log('getObject:', path)

    var t = this
    t.props.ipfs.object.get(path, function(err, res) {
      if(err) return console.error(err)

      window.location = '#/objects/' + path
      t.setState({ object: res })
    })
  },

  updateHash: function(e) {
    var hash = $(e.target).val().trim()
    console.log('updateHash:', hash)
    this.setState({ hash: hash })
  },

  update: function(e) {
    if(e.which && e.which !== 13) return
    if(this.state.hash) this.getObject(this.state.hash)
  },

  render: function() {
    var object = this.state.object ? Object({
      object: this.state.object,
      handleLink: this.handleLink,
      handleBack: this.handleBack,
      path: this.state.hash
    }) : null

    return (
      <div className="row">
        <div className="col-sm-10 col-sm-offset-1 webui-dag">
          <div className="row">
            <h4>Enter hash or path</h4>
            <div className="path row">
              <div className="col-xs-11">
                <input type="text" className="form-control input-lg" onChange={this.updateHash} onKeyPress={this.update} value={this.state.hash} placeholder="Enter hash or path: /ipfs/QmBpath..."/>
              </div>
              <button className="btn btn-primary go col-xs-1" onClick={this.update}>GO</button>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              {object}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
