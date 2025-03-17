import React from 'react'

import * as iconImports from './index.js'
const icons = Object.keys(iconImports).map((m) => ({
  name: m,
  Icon: iconImports[m]
}))

const filterByTextQuery = (icon, searchQuery) => {
  return icon.name.toLowerCase().includes(searchQuery.toLowerCase())
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
const List = ({ iconFilter, size, fill, stroke }) => {
  const iconFilterNotSet = iconFilter == null || iconFilter.length === 0

  return (
    <>
      <span className="gray">{iconFilterNotSet ? '* Use Storybook controls for prop "iconFilter" to filter icons' : `* Currently filtering icons for "${iconFilter}"`}</span>
      <div className="flex w-100 flex-wrap">
        {icons.filter((i) => filterByTextQuery(i, iconFilter)).map(({ Icon, name }) => (
          <div key={name} className="flex items-center flex-column ma3">
            <Icon fill={fill} stroke={stroke} width={size} height={size} className="transition-all" />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Icons',
  component: List,
  // decorators: [withKnobs],
  argTypes: {
    iconFilter: {
      control: { type: 'text' }
    },
    size: {
      control: {
        type: 'range',
        min: 1,
        max: 200,
        step: 1
      }
    },
    fill: {
      control: {
        type: 'color'
      }
    },
    stroke: {
      control: {
        type: 'color'
      }
    }
  }
}
/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Default = {
  name: 'Icons',
  args: {
    iconFilter: '',
    size: 32,
    fill: undefined,
    stroke: undefined
  }
}
