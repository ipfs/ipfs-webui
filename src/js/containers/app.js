import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import ReduxToastr, {toastr} from 'react-redux-toastr'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {Link, withRouter} from 'react-router-dom'
import i18n from '../utils/i18n.js'
import {parse} from '../utils/path'
import {errors} from '../actions'
import Nav from '../components/nav'

class App extends Component {
  componentWillReceiveProps (nextProps) {
    const {errorMessage} = this.props

    if (nextProps.errorMessage && errorMessage !== nextProps.errorMessage) {
      toastr.error(nextProps.errorMessage, {
        onHideComplete: () => {
          this.props.resetErrorMessage()
        }
      })
    }
  }

  goToHashOrPath = () => {
    this.context.router.history.push(`/objects${parse(this.refs.dagPath.value).urlify()}`)
  }

  render () {
    const {children} = this.props

    return (
      <div>
        <ReduxToastr
          timeOut={5000}
          newestOnTop={false}
          position='top-right' />
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
                      <input type='text' ref='dagPath' className='form-control dag-path' placeholder={i18n.t('Enter a hash')} />
                    </div>
                    <button className='btn btn-third btn-xs'
                      onClick={this.goToHashOrPath}>
                      {i18n.t('GO')}
                    </button>
                  </form>
                  <ul className='nav navbar-nav navbar-right collapse navbar-collapse'>
                    <li>
                      <a href='https://ipfs.io' target='_blank' data-toggle='tooltip' data-placement='bottom' title={i18n.t('About IPFS')}>
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
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.string,
  resetErrorMessage: PropTypes.func.isRequired,
  // Injected by React Router
  children: PropTypes.node
  // params: PropTypes.object,
  // location: PropTypes.object
}

App.contextTypes = {
  router: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    errorMessage: state.errors
  }
}

export default withRouter(DragDropContext(HTML5Backend)(connect(mapStateToProps, {
  resetErrorMessage: errors.resetErrorMessage
})(App)))
