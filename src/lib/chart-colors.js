/**
 * Chart color utilities for theme-aware charts
 */

/**
 * Get chart colors based on current theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {object} Chart color configuration
 */
export const getChartColors = (theme = 'light') => {
  const isDark = theme === 'dark'

  return {
    // Bandwidth chart gradients
    bandwidthIn: {
      start: isDark ? '#69c4cd' : '#70c5cd',
      end: isDark ? '#439a9d' : '#c6f1f3'
    },
    bandwidthOut: {
      start: isDark ? '#f9a13e' : '#f19237',
      end: isDark ? '#fbd38d' : '#f9d1a6'
    },
    // Country chart colors
    countries: isDark
      ? ['#69c4cd', '#f9a13e', '#f36149', '#439a9d']
      : ['#69c4cd', '#f39031', '#ea5037', '#3e9096'],
    // Speedometer colors
    speedometer: {
      in: isDark ? '#69c4cd' : '#69c4cd',
      out: isDark ? '#f9a13e' : '#f39021',
      background: isDark ? '#1a4a5f' : '#DEDEDE' // Navy background for dark mode
    },
    // Map colors
    map: {
      dot: isDark ? '#9ad4db' : '#AAA', // Aqua-muted for better visibility on navy
      stroke: isDark ? '#3d6b85' : '#DDD' // Lighter navy for borders
    }
  }
}

/**
 * Create gradient for bandwidth chart
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string} theme - Current theme
 * @returns {object} Gradient configuration
 */
export const createBandwidthGradients = (ctx, width, height, theme = 'light') => {
  const colors = getChartColors(theme)
  const gradientIn = ctx.createLinearGradient(width / 2, 0, width / 2, height)
  gradientIn.addColorStop(0, colors.bandwidthIn.start)
  gradientIn.addColorStop(1, colors.bandwidthIn.end)
  const gradientOut = ctx.createLinearGradient(width / 2, 0, width / 2, height / 2)
  gradientOut.addColorStop(0, colors.bandwidthOut.start)
  gradientOut.addColorStop(1, colors.bandwidthOut.end)
  return { gradientIn, gradientOut }
}
export default getChartColors
