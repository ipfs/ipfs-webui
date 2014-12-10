var React = require('react')
var Router = require('react-router')
var Nav = require('../views/nav.jsx')
var Object = require('../views/object.jsx')

module.exports = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function() {
    console.log(this)
    var hash = this.getParams().hash.replace(/[.]/g, '/')
    if(hash) this.getObject(hash)

    return { object: null, hash: hash || '' }
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

      var url = '/objects/' + path.replace(/[\/]/g, '.')
      if(window.location.pathname !== url)
        window.history.pushState('', path, url)
      t.setState({ object: res })
    })
  },

  handleHash: function(e) {
    var hash = $(e.target).val().trim()
    console.log('handleHash:', hash)
    if(hash) this.getObject(hash)
    this.setState({ hash: hash })
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
        <div className="col-sm-10 col-sm-offset-1">
          <div className="input-group">
            <span className="input-group-addon input-lg">/ipfs/</span>
            <input type="text" className="form-control input-lg" placeholder="Enter the hash or path of an object" onChange={this.handleHash} value={this.state.hash}/>
          </div>
          <br/>

          {object}
        </div>
      </div>
    )
  }
})
