import React from 'react'
import ProgressBar from './progress-bar.js'

const meta = {
  title: 'Progress Bars',
  component: ProgressBar
} as const

export default meta

export const Colors = () => (
  <div className="ma2">
    <ProgressBar bg="bg-navy" progress={42} />
    <ProgressBar bg="bg-aqua" progress={54} />
    <ProgressBar bg="bg-gray" progress={78} />
    <ProgressBar bg="bg-charcoal" progress={21} />
    <ProgressBar bg="bg-red" progress={100} />
    <ProgressBar bg="bg-yellow" progress={94} />
    <ProgressBar bg="bg-teal" progress={23} />
    <ProgressBar bg="bg-green" progress={65} />
    <ProgressBar bg="bg-snow" progress={58} />
  </div>
)
