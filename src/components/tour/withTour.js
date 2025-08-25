import React from 'react'
import { connect } from 'redux-bundler-react'
import { STATUS } from 'react-joyride'

/**
 * @param {React.ComponentType<any>} WrappedComponent
 * @returns {React.ComponentType<any>}
 */
const withTour = WrappedComponent => {
  class WithTour extends React.Component {
    /**
     * @param {any} data
     */
    handleJoyrideCallback = (data) => {
      const { doDisableTours } = this.props
      const { action, status } = data

      if (action === 'close' || [STATUS.FINISHED].includes(status)) {
        doDisableTours()
      }
    }

    render () {
      return <WrappedComponent handleJoyrideCallback={this.handleJoyrideCallback} {...this.props} />
    }
  }

  return connect('doDisableTours', WithTour)
}

export default withTour
