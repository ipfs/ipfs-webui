var React = require('react')
var Nav = require('./nav.jsx')

// var Navbar = require('react-bootstrap/Navbar')
// var Nav = require('react-bootstrap/Nav')
// var NavItem = require('react-bootstrap/NavItem')

module.exports = React.createClass({

  render: function() {
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
              <img src="/static/img/ipfs-logo-128.png" />
            </a>
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
        {this.props.children}
      </div>
    </div>
    )
  }
})
