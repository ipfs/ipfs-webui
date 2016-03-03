import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {errors, router} from '../actions'
import {Grid, Row, Col} from 'react-bootstrap'

import Nav from '../views/nav'

class App extends Component {
  static propTypes = {
    // Injected by React Redux
    errorMessage: PropTypes.string,
    inputValue: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    updateRouterState: PropTypes.func.isRequired,
    resetErrorMessage: PropTypes.func.isRequired,
    // Injected by React Router
    children: PropTypes.node,
    params: PropTypes.object,
    location: PropTypes.object
  };

  handleChange = (nextValue) => {
    this.props.navigate(`/${nextValue}`)
  };

  handleDismissClick = (event) => {
    this.props.resetErrorMessage()
    event.preventDefault()
  };

  componentWillMount () {
    const {params, location: {pathname}} = this.props

    this.props.updateRouterState({
      pathname,
      params
    })
  }

  componentWillReceiveProps (nextProps) {
    const {params, location: {pathname}} = this.props

    if (pathname !== nextProps.location.pathname) {
      this.props.updateRouterState({
        pathname,
        params
      })
    }
  }

  renderErrorMessage () {
    const {errorMessage} = this.props

    if (!errorMessage) return null

    return (
      <p style={{backgroundColor: '#e99'}}>
        <b>{errorMessage}</b>
        {' '}
        <a
          href='#'
          onClick={this.handleDismissClick}
        >
          Dismiss
        </a>
      </p>
    )
  }

  render () {
    const {children} = this.props

    return (
      <Grid fluid>
        {this.renderErrorMessage()}
        <Row>
          <div className='navbar-collapse collapse in'>
            <Col sm={2} className='sidebar'>
              <Nav />
            </Col>
          </div>
          <Col sm={10} smPush={2} className='main'>
            {children}
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps (state) {
  return {
    errorMessage: state.errorMessage,
    inputValue: state.router.pathname.substring(1)
  }
}

export default connect(mapStateToProps, {
  navigate: router.navigate,
  updateRouterState: router.updateRouterState,
  resetErrorMessage: errors.resetErrorMessage
})(App)
