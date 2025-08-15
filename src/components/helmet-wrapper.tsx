import React from 'react'
// @ts-expect-error - Helmet is not typed
import { Helmet as ReactHelmet } from 'react-helmet'

interface HelmetProps {
  children?: React.ReactNode
}

const Helmet: React.FC<HelmetProps> = ({ children }) => {
  const HelmetComponent = ReactHelmet as unknown as React.FC<HelmetProps>
  return <HelmetComponent>{children}</HelmetComponent>
}

export default Helmet
