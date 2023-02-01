// @ts-check
import Breadcrumbs from './Breadcrumbs.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Files/Header',
  component: Breadcrumbs,
  argTypes: {
    onClick: { action: 'clicked' }
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  args: {
    path: '/home/this is a very very very long folder/another sub path/oi/other'
  }
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Combined = {
  args: {
    path: '/ipns/ipfs.io/index.html'
  }
}
