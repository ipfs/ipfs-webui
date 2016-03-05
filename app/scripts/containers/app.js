import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Grid, Row, Col} from 'react-bootstrap'
import ReduxToastr, {toastr} from 'react-redux-toastr'

import {errors, router} from '../actions'
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

  componentWillMount () {
    const {params, location: {pathname}} = this.props

    this.props.updateRouterState({
      pathname,
      params
    })
  }

  componentWillReceiveProps (nextProps) {
    const {params, location: {pathname}, errorMessage} = this.props

    if (pathname !== nextProps.location.pathname) {
      this.props.updateRouterState({
        pathname,
        params
      })
    }

    if (nextProps.errorMessage &&
        errorMessage !== nextProps.errorMessage) {
      toastr.error(nextProps.errorMessage, {
        onHideComplete: () => {
          this.props.resetErrorMessage()
        }
      })
    }
  }

  render () {
    const {children} = this.props

    return (
      <Grid fluid>
        <ReduxToastr
          timeOut={5000}
          newestOnTop={false}
          position='top-right'/>
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
    errorMessage: state.errors,
    inputValue: state.router.pathname.substring(1)
  }
}

export default connect(mapStateToProps, {
  navigate: router.navigate,
  updateRouterState: router.updateRouterState,
  resetErrorMessage: errors.resetErrorMessage
})(App)
