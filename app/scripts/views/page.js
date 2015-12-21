var React = require('react')
var ReactDOM = require('react-dom')
var Nav = require('./nav')
var RouteHandler = require('react-router').RouteHandler
var Link = require('react-router').Link
var $ = require('jquery')
var i18n = require('../utils/i18n.js')

var host = window.location.hostname
var port = window.location.port || 80

if (process.env.NODE_ENV !== 'production') {
  host = 'localhost'
  port = '5001'
}

var ipfs = require('ipfs-api')(host, port)
var ipfsHost = window.location.host

var Page = React.createClass({
  displayName: 'Page',
  getInitialState: function () {
    var t = this

    ipfs.config.get('Addresses.Gateway', function (err, res) {
      if (err || !res) return console.error(err)

      var split = res.Value.split('/')
      var port = split[4]

      t.setState({ gateway: 'http://' + window.location.hostname + ':' + port })
    })

    ipfs.version(function (err, res) {
      if (err) return console.error(err)
      t.setState({ version: res.Version })
    })

    // Not currently available
    // ipfs.update.check(function (err, res) {
    //  if (!err && typeof res === 'object') t.setState({ updateAvailable: true })
    // })

    return {
      version: '',
      updateAvailable: false,
      updating: false,
      gateway: 'http://127.0.0.1:8080'
    }
  },

  showDAG: function () {
    var path = $(ReactDOM.findDOMNode(this)).find('.dag-path').val()
    window.location = '#/objects/object/' + path.replace(/\//g, '\\')
  },

  update: function () {
    var t = this
    ipfs.update.apply(function (err, res) {
      t.setState({ updating: false })
      if (!err) window.location = window.location.toString()
    })
    t.setState({ updating: true })
  },

  render: function () {
    var update = null
    if (this.state.updateAvailable) {
      var updateButtonClass = 'btn btn-link'
      if (this.state.updating) updateButtonClass += ' disabled'

      update = (
        <div className='alert alert-warning'>
          <span><i className='fa fa-warning'></i> {i18n.t('A new version of IPFS is available.')} </span>
          <button className={updateButtonClass} onClick={this.update}>Click here to update.</button>
        </div>
      )
    }

    return (
    <div>
      <div className='bs-navbar'>
      <nav className='navbar navbar-inverse navbar-fixed-top'>
        {/* We use the fluid option here to avoid overriding the fixed width of a normal container within the narrow content columns. */}
        <div className='container-fluid'>
            <div className='row'>
                  <div className='col-sm-2 branding'>
                    <div className='row'>
                          <div className='navbar-header'>
                            <Link className='navbar-brand col-xs-12' to='home'>
                              <img src={require('../../img/logo.png')} alt='IPFS' className='img-responsive logo'/><span className='sr-only'>{i18n.t('IPFS')}</span>
                            </Link>
                          </div>
                       </div>
                  </div>
                  <div className='col-sm-10'>
                      <form className='navbar-form navbar-left collapse navbar-collapse col-xs-6'>
                        <div className='form-group'>
                          <input type='text' className='form-control dag-path' placeholder={i18n.t('Enter a hash or path')} />
                        </div>
                        <button className='btn btn-third btn-xs' onClick={this.showDAG}>{i18n.t('GO')}</button>
                      </form>
                        <ul className='nav navbar-nav navbar-right collapse navbar-collapse'>
                          <li>
                              <a href='http://ipfs.io' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('About IPFS')}>
                                  <img src={require('../../img/help.png')} alt='Help' className='img-responsive icon'/><span className='sr-only'>{i18n.t('Help')}</span>
                              </a>
                          </li>
                          <li>
                              <a href='https://github.com/ipfs/webui' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('Github Repository')}>
                                  <img src={require('../../img/git.png')} alt='Github' className='img-responsive icon'/><span className='sr-only'>{i18n.t('Github')}</span>
                              </a>
                          </li>
                          <li>
                              <a href='https://github.com/ipfs/webui/issues/new' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('Report Bugs')}>
                                  <img src={require('../../img/bug.png')} alt='Report a bug' className='img-responsive icon'/><span className='sr-only'>{i18n.t('Report a bug')}</span>
                              </a>
                          </li>
                        </ul>

                  </div>
               </div>
        </div>
      </nav>
      </div>{/* end navbar */}

      <div className='container-fluid'>
        <div className='row'>

          <div className='navbar-collapse collapse in' id='bs4'>
            <div className='col-sm-2 sidebar'>
              <Nav/>
            </div>{/* end row */}
          </div>{/* end navbar collapse */}

          <div className='col-sm-10 col-sm-push-2'>
            {update}
            <RouteHandler ipfs={ipfs} host={ipfsHost} gateway={this.state.gateway} />
          </div>
        </div>
      </div>
    </div>
    )
  }
})

module.exports = Page
