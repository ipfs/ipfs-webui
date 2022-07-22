// @ts-check
import React from '@storybook/react'
import Breadcrumbs from './Breadcrumbs'

/**
 * @type {import('@storybook/react').Meta}
 */
const BreadcrumbsStory = {
  title: 'Files/Header',
  component: Breadcrumbs,
  argTypes: {
    onClick: { action: 'clicked' }
  }
}

export default BreadcrumbsStory

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
