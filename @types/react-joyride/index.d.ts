import { Step } from 'react-joyride'

declare module 'react-joyride' {
  import type { TFunction } from 'i18next'
  import type { Trans } from 'react-i18next'

  /**
   * Custom Tour interface that extends the official types
   * to include a getSteps function with translation support
   */
  export interface CustomTour {
    getSteps: (props: {
      t: TFunction
      Trans?: typeof Trans
    }) => Step[]
    styles: {
      options?: Record<string, any>
      tooltip?: Record<string, any>
      tooltipContent?: Record<string, any>
      tooltipFooter?: Record<string, any>
      [key: string]: any
    }
  }
}
