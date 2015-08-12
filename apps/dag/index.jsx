var React = require('react/addons')
var ObjectView = require('./js/object.jsx')
var ipfsapp = require('ipfs-web-app')
var upath = require('ipfs-webui-common').Path

var DAG = React.createClass({
  displayName: 'Objects',
  propTypes: {
    gateway: React.PropTypes.string,
    ipfs: React.PropTypes.object
  },
  mixins: [React.addons.LinkedStateMixin],

  componentWillReceiveProps: function (newProps) {
    if (newProps.path) {
      this.getObject(newProps.path)
    } else {
      this.setState({ object: null })
    }
  },

  getInitialState: function () {
    return {
      path: null
    }
  },

  componentWillUpdate: function (props, state) {
    if (state.path !== this.state.path) {
      this.getObject(state.path)
    }
  },

  getObject: function (path) {
    var t = this
    t.props.ipfs.object.get(path.toString(), function (err, res) {
      if (err) return t.setState({ error: err })

      t.setState({ error: null,
                   object: res,
                   permalink: null})
      if (path.protocol === 'ipns') {
        // also resolve the name
        t.props.ipfs.name.resolve(path.name, function (err, resolved) {
          if (err) return t.setState({ error: err })
          var permalink = upath.parse(resolved.Path).append(path.path)
          t.setState({ permalink: permalink })
        })
      }
    })
  },

  update: function (e) {
    if (e.which && e.which !== 13) return

    var path = this.state.pathInput

    // make sure we use relative paths
    if (path[0] === '/') path = path.substr(1)

    ipfsapp.link(path)
  },

  render: function () {
    var error = this.state.error ?
      <div className='col-xs-12'>
        <h4>Error</h4>
        <div className='panel panel-default padded'>
          {this.state.error.Message}
        </div>
      </div>
      : null

    // TODO add provider-view here
    var views = {
      object: (!error && this.state.object ?
        <div className='col-xs-12'>
          <ObjectView
                 object={this.state.object}
                 path={this.state.path}
                 permalink={this.state.permalink}
                 gateway={this.props.gateway} />
        </div> : null)
    }

    // var params = this.context.router.getCurrentParams()
    var tab = 'object'

    return (
      <div className='webui-dag'>
        <div className='row'>
          <div className='col-xs-10'>
            <h4>Enter hash or path</h4>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-10'>
            <input type='text'
              valueLink={this.linkState('pathInput')}
              className='form-control input-lg'
              onKeyPress={this.update}
              placeholder='Enter hash or path: /ipfs/QmBpath...'/>
          </div>
          <div className='col-xs-2'>
            <button className='btn btn-primary go'
              onClick={this.update}>
              GO
            </button>
          </div>
          {views[tab]}
        </div>
        <div className='row'>
          {error}
        </div>
      </div>
    )
  }
})

ipfsapp.define({
  init: function (ipfs, path) {
    this.ref = React.render(<DAG ipfs={ipfs} />,
                       document.getElementById('mount'))
    this.follow(path)
  },
  follow: function (path) {
    if (path) {
      if (path.substr(0, 4) === 'ipfs') {
        path = '/' + path
      }
      this.ref.setState({ path: upath.parse(path),
                          pathInput: upath.parse(path).toString() })
    }
  }
})
