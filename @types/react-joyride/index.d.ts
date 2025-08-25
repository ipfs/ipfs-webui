declare module 'react-joyride' {
  import React from 'react'

  export interface Step {
    target?: string | HTMLElement
    content: React.ReactNode
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'center' | 'auto'
    title?: React.ReactNode
    disableBeacon?: boolean
    locale?: Record<string, string>
    [key: string]: any
  }

  export interface ReactJoyrideProps {
    steps: Step[]
    run?: boolean
    continuous?: boolean
    scrollToFirstStep?: boolean
    showProgress?: boolean
    showSkipButton?: boolean
    styles?: {
      options?: Record<string, any>
      tooltip?: Record<string, any>
      tooltipContent?: Record<string, any>
      tooltipFooter?: Record<string, any>
      [key: string]: any
    }
    callback?: (data: any) => void
    locale?: Record<string, string>
    [key: string]: any
  }

  const ReactJoyride: React.FC<ReactJoyrideProps>
  export default ReactJoyride

  export interface Tour {
    getSteps: (props: Record<string, any>) => Step[]
    styles: {
      options?: Record<string, any>
      tooltip?: Record<string, any>
      tooltipContent?: Record<string, any>
      tooltipFooter?: Record<string, any>
      [key: string]: any
    }
    [key: string]: any
  }

  export const STATUS: {
    INIT: string
    READY: string
    WAITING: string
    RUNNING: string
    PAUSED: string
    SKIPPED: string
    FINISHED: string
    ERROR: string
  }
}
