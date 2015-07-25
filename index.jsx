var React = require('react/addons')
var ipfsapp = require('ipfs-web-app')
var request = require('browser-request')
var $ = require('jquery')
var _ = require('lodash')

var Navigation = React.createClass({
  displayName: 'Navigation',
  mixins: [React.addons.LinkedStateMixin],

  propTypes: {
    ipfs: React.PropTypes.object,
    apps: React.PropTypes.object,
    path: React.PropTypes.string
  },

  // keep a cache of apps, so as not to have to reload them each time
  appframes: {},

  getInitialState: function () {
    return {
      version: '',
      addrbar: '',
      active: null,
      activePath: null,
      updateAvailable: false,
      updating: false,
      gateway: 'http://127.0.0.1:8080'
    }
  },

  componentWillReceiveProps: function (newProps) {
    var split = newProps.path.split('/')
    this.setState({ activePath: this.props.apps[split[1]].hash })
    if (!split[0]) {
      // absolute path
      var frame = this.getAppFrame(this.props.apps[split[1]].hash,
                                   split.slice(2).join('/'))
      this.showApp(frame)
    } else {
      // relative path
      this.showApp(this.state.active,
                   split.join('/'))
    }
  },

  showDAG: function (e) {
    var path = this.state.addrbar
    if (path[0] === '/') {
      path = path.substr(1)
    }
    this.setState({ addrbar: '' })
    ipfsapp.link('/DAG/' + path)
    e.preventDefault()
  },

  update: function () {
    var self = this
    // self.props.env.ipfs.update.apply(function (err, res) {
    //   // console.log(err, res)
    //   t.setState({ updating: false })
    //   if (!err) window.location = window.location.toString()
    // })
    self.setState({ updating: true })
  },

  getAppFrame: function (hash, path) {
    if (this.appframes[hash]) {
      var frame = this.appframes[hash]
      frame.contentWindow.postMessage(['follow', path], '*')
      return this.appframes[hash]
    } else {
      var appframe = ipfsapp.load(window.location.pathname + hash,
                                  path,
                                  this.props.ipfs,
                                  $('#content').get(0))
      this.appframes[hash] = appframe
      return appframe
    }
  },

  showApp: function (appframe) {
    this.setState({ active: appframe })

    _.forEach(this.appframes, function (frame) {
      $(frame).hide()
    })

    $(appframe).show()
  },

  render: function () {
    var self = this
    var update = null
    if (this.state.updateAvailable) {
      var updateButtonClass = 'btn btn-link'
      if (this.state.updating) updateButtonClass += ' disabled'

      update = (
        <div className='alert alert-warning'>
          <span><i className='fa fa-warning'></i> A new version of IPFS is available. </span>
          <button className={updateButtonClass} onClick={this.update}>Click here to update.</button>
        </div>
      )
    }

    var apps = (
      <div className='row'>
        <ul id='side' className='nav nav-sidebar'>
          {
            _.map(self.props.apps, function (app, name) {
              return (
                  <li key={ name }>
                  <a className={(self.state.activePath === app.hash) ? 'link active' : 'link'}
                onClick={function () {
                  // absolute path in link
                  ipfsapp.link('/' + name)
                }}>
                  <span className={'icon fa ' + app.icon} aria-hidden='true'></span>
                  { name }
                </a>
                  </li>)
            })
          }
        </ul>
      </div>)

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
                            <div className='navbar-brand col-xs-12' to='home'>
                              <img src='img/logo.png' alt='IPFS' className='img-responsive logo'/><span className='sr-only'>IPFS</span>
                            </div>
                          </div>
                       </div>
                  </div>
                  <div className='col-sm-10'>
                      <form className='navbar-form navbar-left collapse navbar-collapse col-xs-6'>
                        <div className='form-group'>
                          <input type='text'
                            valueLink={this.linkState('addrbar')}
                            className='form-control dag-path'
                            placeholder='Enter a hash or path' />
                        </div>
                        <button className='btn btn-third btn-xs' onClick={this.showDAG}>GO</button>
                      </form>
                        <ul className='nav navbar-nav navbar-right collapse navbar-collapse'>
                          <li>
                              <a href='http://ipfs.io' target='_blank' data-toggle='tooltip' data-placement='bottom' title='About IPFS'>
                                  <img src='img/help.png' alt='Help' className='img-responsive icon'/><span className='sr-only'>Help</span>
                              </a>
                          </li>
                          <li>
                              <a href='#' target='_blank' data-toggle='tooltip' data-placement='bottom' title='Documentation'>
                                  <img src='img/info.png' alt='Documentation' className='img-responsive icon'/><span className='sr-only'>Documentation</span>
                              </a>
                          </li>
                          <li>
                              <a href='https://github.com/jbenet/go-ipfs' target='_blank' data-toggle='tooltip' data-placement='bottom' title='Github Repository'>
                                  <img src='img/git.png' alt='Github' className='img-responsive icon'/><span className='sr-only'>Github</span>
                              </a>
                          </li>
                          <li>
                              <a href='https://github.com/jbenet/go-ipfs/issues/new' target='_blank' data-toggle='tooltip' data-placement='bottom' title='Report Bugs'>
                                  <img src='img/bug.png' alt='Report a bug' className='img-responsive icon'/><span className='sr-only'>Report a bug</span>
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
              { apps }
            </div>{/* end row */}
          </div>{/* end navbar collapse */}

          <div className='col-sm-10 col-sm-push-2'>
            <div id='content'></div>
            {update}
          </div>
        </div>
      </div>
    </div>
    )
  }
})

ipfsapp.define({
  init: function (ipfs, path) {
    var self = this
    request('default_apps.json', function (err, res) {
      if (err) throw err
      var apps = {}
      _.forEach(JSON.parse(res.body), function (app) {
        apps[app.displayname] = app
      })
      self.ref = React.render(<Navigation apps={apps} ipfs={ipfs} />,
                              document.getElementById('mount'))
      self.follow(path)
    })
  },
  follow: function (path) {
    if (path) {
      this.ref.setProps({path: path})
    } else {
      ipfsapp.link('/Home')
    }
  },
  resolve: function (relative) {
    return '/' + this.ref.props.path.split('/')[1] + '/' + relative
  }
})
