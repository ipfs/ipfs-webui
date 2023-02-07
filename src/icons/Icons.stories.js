// import React from '@storybook/react'
import { withKnobs, text, number, color } from '@storybook/addon-knobs'

const requireContext = require.context('.', true, /\.js?$/)
const modules = requireContext.keys().filter((c) => !c.includes('.stories') && !c.includes('index.js'))
const icons = modules.map((m) => ({
  name: m.replace('./', '').replace('.js', ''),
  Icon: requireContext(m).default
}))

const filterByTextQuery = (icon) => {
  const searchQuery = text('Search', '')
  return icon.name.includes(searchQuery)
}

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Icons',
  decorators: [withKnobs]
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const List = () => {
  const size = number('Size', 32, { range: true, min: 1, max: 200, step: 1 })
  const fill = color('Fill', undefined)
  const stroke = color('Stroke', undefined)

  return (
    <div className="flex w-100 flex-wrap">
      {icons.filter(filterByTextQuery).map(({ Icon, name }) => (
        <div className="flex items-center flex-column ma3">
          <Icon fill={fill} stroke={stroke} width={size} height={size} className="transition-all" />
          <span>{name}</span>
        </div>
      ))}
    </div>
  )
}
