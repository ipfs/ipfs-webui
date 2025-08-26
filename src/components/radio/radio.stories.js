import React from 'react'
import Radio from './radio'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Radio',
  component: Radio,
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the radio button is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio button is disabled'
    },
    label: {
      control: 'text',
      description: 'Label text for the radio button'
    },
    onChange: {
      action: 'changed'
    }
  }
}

// Template function to reduce code duplication
const RadioTemplate = (args, { initialChecked = false, style = {} } = {}) => {
  const [checked, setChecked] = React.useState(initialChecked)

  return (
    <div>
      <Radio
        className="ma2"
        style={style}
        {...args}
        checked={checked}
        onChange={setChecked}
      />
    </div>
  )
}

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Default = (args) => RadioTemplate(args)

Default.args = {
  label: 'Click me!',
  disabled: false
}

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Disabled = (args) => RadioTemplate(args)

Disabled.args = {
  label: 'Click me!',
  disabled: true
}

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Big = (args) => RadioTemplate(args, { style: bigPicture })

Big.args = {
  label: 'Click me!',
  disabled: false
}

/**
 * @type {import('@storybook/react').StoryFn}
 */
export const Checked = (args) => RadioTemplate(args, { initialChecked: true })

Checked.args = {
  label: 'Click me!',
  disabled: false
}
