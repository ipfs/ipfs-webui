// Components
import { JsonEditor } from './JsonEditor.js'

// Fixtures
import config from './fixtures/example-config.json'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'JSON Editor',
  component: JsonEditor,
  args: {
    value: JSON.stringify(config, null, 2),
    readOnly: false
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {}
