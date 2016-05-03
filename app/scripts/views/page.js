import React from 'react'
import Nav from './nav'
import {Link} from 'react-router'

import i18n from '../utils/i18n.js'
import {parse} from '../utils/path'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const ipfs = require('ipfs-api')(host, port)

export
default class Page extends React.Component {
  state = {
    version: '',
    updateAvailable: false,
    updating: false,
    gateway: 'http://127.0.0.1:8080'
  };

  static displayName = 'Page';
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  static propTypes = {
    children: React.PropTypes.object
  };

  componentDidMount () {
    ipfs.version((err, res) => {
      if (err) return console.error(err)
      this.setState({
        version: res.Version
      })
    })
    ipfs.config.get('Addresses.Gateway', (err, res) => {
      if (err || !res) return console.error(err)
      const split = res.Value.split('/')
      const port = split[4]
      this.setState({
        gateway: 'http://' + window.location.hostname + ':' + port
      })
    })
  }

  update () {
    ipfs.update.apply((err, res) => {
      this.setState({
        updating: false
      })
      if (!err) window.location = window.location.toString()
    })
    this.setState({
      updating: true
    })
  }

  render () {
    let update = null
    if (this.state.updateAvailable) {
      let updateButtonClass = 'btn btn-link'
      if (this.state.updating) updateButtonClass += ' disabled'

      update = (
        <div className='alert alert-warning'>
          <span>
            <i className='fa fa-warning'></i>
            {i18n.t('A new version of IPFS is available.')}
          </span>
          <button
            className={updateButtonClass}
            onClick={this.update.bind(this)}>
            Click here to update.
          </button>
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
                      <Link className='navbar-brand col-xs-12' to='/'>
                        <img src={require('../../img/logo.png')} alt='IPFS' className='img-responsive logo' />
                        <span className='sr-only'>{i18n.t('IPFS')}</span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className='col-sm-10'>
                  <form className='navbar-form navbar-left collapse navbar-collapse col-xs-6'>
                    <div className='form-group'>
                      <input type='text' ref='dagPath' className='form-control dag-path' placeholder={i18n.t('Enter a hash or path')} />
                    </div>
                    <button className='btn btn-third btn-xs'
                      onClick={() => this.context.router.push(`/objects/${parse(this.refs.dagPath.val()).urlify()}`)}>
                      {i18n.t('GO')}
                    </button>
                  </form>
                  <ul className='nav navbar-nav navbar-right collapse navbar-collapse'>
                    <li>
                      <a href='http://ipfs.io' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('About IPFS')}>
                        <img src={require('../../img/help.png')} alt='Help' className='img-responsive icon' />
                        <span className='sr-only'>{i18n.t('Help')}</span>
                      </a>
                    </li>
                    <li>
                      <a href='https://github.com/ipfs/webui' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('Github Repository')}>
                        <img src={require('../../img/git.png')} alt='Github' className='img-responsive icon' />
                        <span className='sr-only'>{i18n.t('Github')}</span>
                      </a>
                    </li>
                    <li>
                      <a href='https://github.com/ipfs/webui/issues/new' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('Report Bugs')}>
                        <img src={require('../../img/bug.png')} alt='Report a bug' className='img-responsive icon' />
                        <span className='sr-only'>{i18n.t('Report a bug')}</span>
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
                <Nav />
              </div>{/* end row */}
            </div>{/* end navbar collapse */}
            <div className='col-sm-10 col-sm-push-2'>
              {update}
              {this.props.children && React.cloneElement(
                 this.props.children, {ipfs: ipfs, host: host, gateway: this.state.gateway}
               )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
