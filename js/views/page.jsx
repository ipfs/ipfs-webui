var React = require('react')
var Nav = require('./nav.jsx')
var RouteHandler = require('react-router').RouteHandler

// TODO: get this address from a config
var ipfs = require('ipfs-api')(window.location.hostname, window.location.port)
var ipfsHost = window.location.host

module.exports = React.createClass({
  getInitialState: function() {
    var t = this
    ipfs.version(function(err, res) {
      if(err) return console.error(err)
      t.setState({ version: res.Version })
    })

    ipfs.update.check(function(err, res) {
      console.log(err, res)
      if(!err) t.setState({ updateAvailable: true })
    })

    return {
      version: '',
      updateAvailable: false,
      updating: false
    }
  },

  update: function() {
    var t = this
    ipfs.update.apply(function(err, res) {
      console.log(err, res)
      t.setState({ updating: false })
      if(!err) window.location = window.location.toString()
    })
    t.setState({ updating: true })
  },

  render: function() {
    var update = null
    if(this.state.updateAvailable) {
      var updateButtonClass = 'btn btn-link'
      if(this.state.updating) updateButtonClass += ' disabled'

      update = (
        <div className="alert alert-warning">
          <span><i className="fa fa-warning"></i> A new version of IPFS is available. </span>
          <button className={updateButtonClass} onClick={this.update}>Click here to update.</button>
        </div>
      )
    }

    return (
    <div>
      <div className="container">
        <nav className="navbar" role="navigation">

          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand selected" href="/">
              <img src="./static/img/ipfs-logo-128.png" />
            </a>
          </div>

          <div className="navbar-left">
            <span className="webui-version">{this.state.version}</span>
          </div>

          <div className="collapse navbar-collapse" id="navbar-collapse">
            <ul className="nav navbar-nav navbar-right">
              <li><a href="/about" target="_blank"
                data-toggle="tooltip" data-placement="bottom"
                title="About IPFS"><i className="single fa fa-info-circle"></i></a></li>
              <li><a href="/help" target="_blank"
                data-toggle="tooltip" data-placement="bottom"
                title="Docs &amp; Help"><i className="single fa fa-life-saver"></i></a></li>
              <li><a href="https://github.com/jbenet/go-ipfs" target="_blank"
                data-toggle="tooltip" data-placement="bottom"
                title="Github Repository"><i className="single fa fa-github"></i></a></li>
              <li><a href="https://github.com/jbenet/go-ipfs/issues/new" target="_blank"
                data-toggle="tooltip" data-placement="bottom"
                title="Report Bugs"><i className="single fa fa-bug"></i></a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="navhr" style={{margin: "10px 0px 30px"}}></div>

        {/*<div className="col-12 text-center webui-idbanner">
          <a id="key">QmT8uptFpXSmk63VtU8VPy4AGHEbAA7rQWFYJKDggSd2xN</a>
        </div>*/}

      <div className="container">
        {update}

        <div className="col-sm-10 col-sm-offset-1"><Nav/></div>

        <RouteHandler ipfs={ipfs} host={ipfsHost}/>
      </div>
    </div>
    )
  }
})
