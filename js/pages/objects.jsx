var React = require('react')
var Router = require('react-router')
var $ = require('jquery')
var ObjectView = require('../views/object.jsx')

module.exports = React.createClass({
  displayName: 'Objects',
  propTypes: {
    gateway: React.PropTypes.string
  },
  mixins: [ Router.State ],

  componentDidMount: function () {
    window.addEventListener('hashchange', this.handleHashChange)
  },

  componentWillUnmount: function () {
    window.removeEventListener('hashchange', this.handleHashChange)
  },

  getInitialState: function () {
    var hash = window.location.hash.substr('/objects'.length + 1)
    hash = (hash || '').replace(/[\\]/g, '/')
    if (hash.split('/')[0].length === 0) hash = hash.slice(1)
    if (hash) this.getObject(hash)

    return { object: null, hash: hash, hashInput: hash }
  },

  handleHashChange: function () {
    console.log('handleHashChange: ' + this.state.hash + ' ' + window.location.hash)
    var hash = window.location.hash
    if (!/^#\/objects/.test(hash)) return
    hash = hash.substring('#/objects'.length + 1).replace(/\\/g, '/')
    this.setState({ hash: hash,
                    hashInput: hash,
                    object: null,
                    error: null})
    this.getObject(hash)
  },

  handleBack: function (e) {
    var hash = this.state.hash
    var slashIndex = hash.lastIndexOf('/')
    if (slashIndex === -1) return
    hash = hash.substr(0, slashIndex)
    this.setState({ hash: hash })
    this.getObject(hash)
  },

  parsePath: function (path) {
    var pathObj = new function () {
      return {
        toString: function () {
          return '/' + this.protocol + '/' + this.name + this.path
        },
        urlify: function () {
          return '#/objects/' + this.toString().replace(/[\/]/g, '\\')
        }
      }
    }
    var parts = path.split('/')

    if (!parts[0]) {
      pathObj.protocol = parts[1]
      pathObj.name = parts[2]
      pathObj.path = parts.slice(3).join('/')
    } else {
      pathObj.protocol = 'ipfs'
      pathObj.name = parts[0]
      pathObj.path = parts.slice(1).join('/')
    }
    if (pathObj.path) {
      pathObj.path = '/' + pathObj.path
    }

    return pathObj
  },

  getObject: function (path) {
    console.log('getObject:', path)
    var parsedPath = this.parsePath(path)
    var t = this
    t.props.ipfs.object.get(path, function (err, res) {
      if (err) return t.setState({ error: err })

      // don't change until object is recieved
      window.location = parsedPath.urlify()

      if (parsedPath.protocol === 'ipns') {
        // also resolve the name
        t.props.ipfs.name.resolve(parsedPath.name, function (err, res2) {
          if (err) return t.setState({ error: err })

          res.Resolved = t.parsePath(res2.Key + parsedPath.path)
          t.setState({ object: res })
        })
      } else {
        t.setState({ object: res })
      }
    })
  },

  updateHash: function (e) {
    var hash = $(e.target).val().trim()
    this.setState({ hashInput: hash })
  },

  update: function (e) {
    if (e.which && e.which !== 13) return
    this.setState({ hash: this.state.hashInput })
    if (this.state.hashInput) this.getObject(this.state.hashInput)
  },

  render: function () {
    var error = this.state.error ?
      <div className='row'>
        <h4>Error</h4>
        <div className='panel panel-default padded'>
          {this.state.error.Message}
        </div>
      </div>
      : null

    var object = !error && this.state.object ?
      <div className='row'>
        <div className='col-xs-12'>
          <ObjectView object={this.state.object} handleBack={this.handleBack}
            path={this.state.hash} gateway={this.props.gateway} />
        </div>
      </div>
      : null

    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1 webui-dag'>
          <div className='row'>
            <h4>Enter hash or path</h4>
            <div className='path row'>
              <div className='col-xs-11'>
                <input type='text' className='form-control input-lg' onChange={this.updateHash} onKeyPress={this.update} value={this.state.hashInput} placeholder='Enter hash or path: /ipfs/QmBpath...'/>
              </div>
              <button className='btn btn-primary go col-xs-1' onClick={this.update}>GO</button>
            </div>
          </div>
          {error}
          {object}
        </div>
      </div>
    )
  }
})
