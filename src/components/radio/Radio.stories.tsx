import { action } from '@storybook/addon-actions'
import { StoryFn, Meta } from '@storybook/react'
import Radio from './Radio.js'

const bigPicture = {
  transform: 'scale(5)',
  transformOrigin: 'top left'
}

const meta: Meta<typeof Radio> = {
  title: 'Radio',
  component: Radio
}

export default meta

export const Default: StoryFn<typeof Radio> = () => (
  <div>
    <Radio className='ma2' label='Click me!' onChange={action('Checked')} />
  </div>
)

export const Disabled: StoryFn<typeof Radio> = () => (
  <div>
    <Radio label='Click me!' className='ma2' disabled onChange={action('Checked')} />
  </div>
)

export const Big: StoryFn<typeof Radio> = () => (
  <div>
    <Radio style={bigPicture} label='Click me!' className='ma2' onChange={action('Checked')} />
  </div>
)
