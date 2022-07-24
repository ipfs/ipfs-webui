// Components
import JsonEditor from './JsonEditor'

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

export const Default = {}
