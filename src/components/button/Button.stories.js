import React from 'react'
import { action } from '@storybook/addon-actions'

import Button from './Button.js'

/**
 * @type {import('@storybook/react').Meta}
 */
export default {
  title: 'Button'
}

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const Colors = () => (
  <div>
    <Button className="ma2" onClick={action('aqua-click')}>
            Aqua
    </Button>
    <Button className="ma2" bg="bg-teal" onClick={action('teal-click')}>
            Teal
    </Button>
    <Button className="ma2" bg="bg-navy" onClick={action('navy-click')}>
            Navy
    </Button>
    <Button className="ma2" bg="bg-orange" onClick={action('orange-click')}>
            Orange
    </Button>
    <Button className="ma2" bg="bg-red" onClick={action('red-click')}>
            Red
    </Button>
    <Button className="ma2" disabled onClick={action('disabled-click')}>
            Disabled
    </Button>
    <Button className="ma2" minWidth={100} onClick={action('smol-click')}>
            Smol
    </Button>
    <Button className="ma2" onClick={action('hotpink-click')} style={{ background: 'hotpink' }}>
            Custom
    </Button>
  </div>
)
