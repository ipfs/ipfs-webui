import React from 'react'
import * as iconImports from './index'

type SvgComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const icons = Object.entries(iconImports)
  .map(([name, Icon]) => ({
    name,
    Icon: Icon as SvgComponent
  }))

function filterByTextQuery (icon: { name: string }, query: string | undefined | null): boolean {
  if (!query) return true
  return icon.name.toLowerCase().includes(query.toLowerCase())
}

interface ListProps {
  iconFilter?: string;
  size?: number | string;
  fill?: string;
  stroke?: string;
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
const List = ({ iconFilter, size, fill, stroke }: ListProps) => {
  const iconFilterNotSet = !iconFilter || iconFilter.length === 0

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
// eslint-disable-next-line import/no-anonymous-default-export
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
