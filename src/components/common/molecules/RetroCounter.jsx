import React from 'react'
import propTypes from 'prop-types'
import styled from 'styled-components'

import RetroDigit from '../atoms/RetroDigit'

const CounterWrapper = styled.div`
  display: inline-flex;
  background: #000000;
`

const pixelSizes = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4
}

const RetroCounter = React.forwardRef(function Counter (props, ref) {
  const { value, minLength, size, mainColor, secondaryColor, ...otherProps } = props
  let valueArray = value.toString().split('')
  if (minLength && minLength > valueArray.length) {
    valueArray = [...valueArray, ...Array(minLength - valueArray.length).fill('10')]
  }
  return (
    <CounterWrapper ref={ref} {...otherProps}>
      {valueArray.map((digit, i) => (
        <RetroDigit digit={digit} pixelSize={pixelSizes[size]} mainColor={mainColor} secondaryColor={secondaryColor} key={i} />
      ))}
    </CounterWrapper>
  )
})

RetroCounter.defaultProps = {
  minLength: 3,
  size: 'md',
  value: 0
}

RetroCounter.propTypes = {
  minLength: propTypes.number,
  size: propTypes.oneOf(['sm', 'md', 'lg']),
  value: propTypes.number
}

export default RetroCounter
