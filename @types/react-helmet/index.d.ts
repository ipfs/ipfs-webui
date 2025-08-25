declare module 'react-helmet' {
  import React from 'react'

  export interface HelmetProps {
    children?: React.ReactNode
    title?: string
    meta?: Array<{
      name?: string
      content?: string
      property?: string
    }>
    link?: Array<{
      rel?: string
      href?: string
    }>
  }

  export class Helmet extends React.Component<HelmetProps> {}
}
