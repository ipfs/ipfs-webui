// @ts-check
import ThemeSelector from './ThemeSelector.js'
import { ThemeProvider } from '../../contexts/theme-context.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Settings/Theme Selector',
  component: ThemeSelector,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="pa4 bg-white" style={{ maxWidth: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    )
  ]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {}
