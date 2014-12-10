var React = require('react')
var Router = require('react-router')
var Nav = require('../views/nav.jsx')
var Object = require('../views/object.jsx')

module.exports = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function() {
    console.log(this)
    var hash = this.getParams().hash
    if(hash) this.getObject(hash)

    return { object: null, hash: '' }
  },

  getObject: function(hash) {
    console.log('getObject:', hash)
    var t = this
    t.props.ipfs.object.get(hash, function(err, res) {
      if(err) return console.error(err)

      var path = '/objects/' + hash
      if(window.location.pathname !== path)
        window.history.pushState('', hash, path)
      t.setState({ object: res, hash: hash })
    })
  },

  handleHash: function(e) {
    var hash = $(e.target).val().trim()
    console.log('handleHash:', hash)
    if(hash) this.getObject(hash)
  },

  render: function() {
    var object = this.state.object ? Object(this.state.object) : null

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
