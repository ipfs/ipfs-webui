import React, {Component, PropTypes} from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router'

window.React = React

class Root extends Component {
  render () {
    const {store, history, routes} = this.props

    return (
      <Provider store={store}>
        <div>
          <Router history={history}>
            {routes}
          </Router>
        </div>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  routes: PropTypes.object.isRequired
}

export default Root
