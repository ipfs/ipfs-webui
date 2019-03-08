import React from 'react'
import { connect } from 'redux-bundler-react'
import { STATUS } from 'react-joyride'

const withTour = WrappedComponent => {
  class WithTour extends React.Component {
    handleJoyrideCallback = (data) => {
      const { doDisableTours } = this.props
      const { status } = data

      if ([STATUS.FINISHED].includes(status)) {
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
