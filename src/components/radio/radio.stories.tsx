import * as React from 'react'
import type { Meta, Story } from '@storybook/react'
import Radio, { type RadioProps } from './radio'

const meta: Meta<RadioProps> = {
  title: 'Radio',
  component: Radio,
  parameters: {
    controls: { exclude: ['onChange'] }
  },
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is checked'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is disabled'
    },
    label: {
      control: { type: 'text' },
      description: 'Label text for the radio button'
    },
    onChange: {
      action: 'changed',
      table: { disable: true }
    },
    className: { control: { type: 'text' } }
  }
}
export default meta

const RadioTemplate = (args: RadioProps) => {
  const { onChange, ...rest } = args
  const [checked, setChecked] = React.useState<boolean>(args.checked ?? false)

  React.useEffect(() => {
    setChecked(args.checked ?? false)
  }, [args.checked])

  return (
    <Radio
      {...rest}
      checked={checked}
      onChange={(next) => {
        onChange?.(next) // trigger SB action
        setChecked(next) // update local state
      }}
    />
  )
}

export const Default: Story<RadioProps> = RadioTemplate.bind({})
Default.args = { label: 'Click me!', disabled: false, checked: false }

export const Disabled: Story<RadioProps> = RadioTemplate.bind({})
Disabled.args = { label: 'Click me!', disabled: true, checked: false }

export const DisabledChecked: Story<RadioProps> = RadioTemplate.bind({})
DisabledChecked.args = { label: 'Click me!', disabled: true, checked: true }

export const Big: Story<RadioProps> = RadioTemplate.bind({})
Big.args = {
  label: 'Click me!',
  disabled: false,
  checked: false,
  style: {
    transform: 'scale(5)',
    transformOrigin: 'top left'
  }
}

export const Checked: Story<RadioProps> = RadioTemplate.bind({})
Checked.args = { label: 'Click me!', checked: true, disabled: false }
