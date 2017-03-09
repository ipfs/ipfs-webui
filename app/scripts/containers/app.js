import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Grid, Row, Col} from 'react-bootstrap'
import ReduxToastr, {toastr} from 'react-redux-toastr'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import {errors} from '../actions'
import Nav from '../views/nav'

class App extends Component {
  static propTypes = {
    // Injected by React Redux
    errorMessage: PropTypes.string,
    resetErrorMessage: PropTypes.func.isRequired,
    // Injected by React Router
    children: PropTypes.node
    // params: PropTypes.object,
    // location: PropTypes.object
  };

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

  render () {
    const {children} = this.props

    return (
      <Grid fluid>
        <ReduxToastr
          timeOut={5000}
          newestOnTop={false}
          position='top-right' />
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
    errorMessage: state.errors
  }
}

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, {
  resetErrorMessage: errors.resetErrorMessage
})(App))
