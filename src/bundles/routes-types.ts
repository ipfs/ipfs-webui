import type React from 'react'

/**
 * src/bundles/routes.js creates a RouteBundle from redux-bundler that provides some objects that are not typed.
 */

/**
 * The type for the object provided by `selectRouteInfo` selector.
 *
 * These types are not 100% accurate and only filled out as accurately as possible as needed.
 */
export interface RouteInfo {
  /**
   * The value of the currently matched pattern from src/bundles/routes.js
   */
  page: React.ReactNode

  params: {
    // if you are on #/diagnostics/logs, this will be equal to '/logs'
    path: string
  }

  /**
   * This will match whatever key is set in src/bundles/routes.js for the page that is currently active.
   * For the diagnostics page, this will be equal to '/diagnostics*'
   */
  pattern: string

  /**
   * The hash of the url, without the hash symbol.
   */
  url: string
}
