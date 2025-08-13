import React, { FC } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import * as iconImports from './index.js'

interface IconItem {
  name: string
  Icon: React.ComponentType<{ fill?: string; stroke?: string; width?: number; height?: number; className?: string }>
}

const icons: IconItem[] = Object.keys(iconImports).map((m) => ({
  name: m,
  Icon: iconImports[m as keyof typeof iconImports] as IconItem['Icon']
}))

const filterByTextQuery = (icon: IconItem, searchQuery: string): boolean => {
  return icon.name.toLowerCase().includes(searchQuery.toLowerCase())
}

interface ListProps {
  iconFilter: string
  size: number
  fill?: string
  stroke?: string
}

const List: FC<ListProps> = ({ iconFilter, size, fill, stroke }) => {
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

const meta: Meta<ListProps> = {
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
export default meta

export const Default: StoryObj<ListProps> = {
  name: 'Icons',
  args: {
    iconFilter: '',
    size: 32,
    fill: undefined,
    stroke: undefined
  }
}
