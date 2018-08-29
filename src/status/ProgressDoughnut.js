import React from 'react'
import {Doughnut} from 'react-chartjs-2'

const rotation = (n) => (0.5 + (1 - n)) * Math.PI
const circumference = (n) => n * 2 * Math.PI

export default function ({ progress = 50, title, color = '#FF6384', howMuchCircunference = 0.7 }) {
  const options = {
    legend: {
      display: false
    },
    title: {
      display: !!title,
      text: title
    },
    rotation: rotation(howMuchCircunference),
    circumference: circumference(howMuchCircunference)
  }

  const data = {
    labels: ['Speed', 'Nothing'],
    datasets: [{
      data: [progress, 100 - progress],
      backgroundColor: [color, '#f5f5f5'],
      hoverBackgroundColor: [color, '#f5f5f5']
    }]
  }

  return (
    <div>
      <Doughnut data={data} options={options} />
    </div>
  )
}
