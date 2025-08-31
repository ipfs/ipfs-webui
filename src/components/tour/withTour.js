import React, { useCallback } from 'react'
import { STATUS } from 'react-joyride'
import { useTours } from '../../contexts/tours-context'

/**
 * @param {React.ComponentType<any>} WrappedComponent
 * @returns {React.ComponentType<any>}
 */
const withTour = WrappedComponent => {
  /**
   * @param {Object} props
   */
  const WithTour = (props) => {
    const { disableTours } = useTours()
    const handleJoyrideCallback = useCallback(
      /**
       * @param {import('react-joyride').CallBackProps} data
       */
      (data) => {
        const { action, status } = data

        if (action === 'close' || status === STATUS.FINISHED) {
          disableTours()
        }
      },[disableTours]
    )

    return <WrappedComponent handleJoyrideCallback={handleJoyrideCallback} {...props} />
  }

  return WithTour
}

export default withTour
