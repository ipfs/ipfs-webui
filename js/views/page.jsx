var React = require('react')
module.exports = (
<div className="container">
  <nav className="navbar" role="navigation">
    <div className="container-fluid">

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
        <ul className="nav navbar-nav navbar-left">
          <li><a id="key">QmT8uptFpXSmk63VtU8VPy4AGHEbAA7rQWFYJKDggSd2xN</a></li>
        </ul>

        <ul className="nav navbar-nav navbar-right">

          <li><a href="/home"><i className="fa fa-desktop"></i> Home</a></li>
          <li><a href="/files"><i className="fa fa-copy"></i> Files</a></li>
          <li><a href="/about"><i className="fa fa-info-circle"></i> About</a></li>
          <li><a href="/help"><i className="fa fa-life-saver"></i> Help</a></li>
          <li><a href="https://github.com/jbenet/go-ipfs" target="_blank"
            data-toggle="tooltip" data-placement="bottom"
            title="Github Repository"><i className="single fa fa-github"></i></a></li>
          <li><a href="https://github.com/jbenet/go-ipfs/issues/new" target="_blank"
            data-toggle="tooltip" data-placement="bottom"
            title="Report Bugs"><i className="single fa fa-bug"></i></a></li>
        </ul>
      </div>
    </div>
  </nav>

<div className="navhr"></div>

<div className="main-content">
<div className="row">
  <div id="col-left" className="col-md-6">

  </div>
  <div id="col-right" className="col-md-6">

  </div>
</div>

</div>
</div>
)
