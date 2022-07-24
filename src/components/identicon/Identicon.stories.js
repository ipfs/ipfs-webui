// @ts-check
import IdenticonEl from './Identicon'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Identicon',
  component: IdenticonEl,
  parameters: {
    actions: {
      disable: false,
      handles: ['click']
    }
  },
  argTypes: {
    onClick: { action: 'clicked' }
  },
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 14
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 14
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Large = {
  args: {
    cid: 'QmYPNmahJAvkMTU6tDx5zvhEkoLzEFeTDz6azDCSNqzKkW',
    className: 'ma2',
    size: 64
  }
}
