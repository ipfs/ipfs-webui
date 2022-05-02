import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import filesize from 'filesize'

const rotation = (n) => (0.5 + (1 - n)) * Math.PI
const circumference = (n) => n * 2 * Math.PI

function Speedometer ({ total = 100, title, filled = 0, noSpeed = false, color = '#FF6384' }) {
  const doughnut = {
    options: {
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      },
      maintainAspectRatio: false,
      cutoutPercentage: 80,
      rotation: rotation(0.7),
      circumference: circumference(0.7)
    },
    data: {
      labels: ['Speed', 'Nothing'],
      datasets: [{
        data: [filled, filled > total ? 0 : total - filled],
        backgroundColor: [color, '#DEDEDE'],
        hoverBackgroundColor: [color, '#DEDEDE'],
        borderWidth: [0, 0]
      }]
    }
  }

  // network bandwidth units matchin 'ipfs stats bw'
  // to align with what ISP usually shows on invoice
  const data = filesize(filled, {
    standard: 'iec',
    base: 2,
    output: 'array',
    round: 0,
    bits: false
  })

  return (
    <div className='relative tc center overflow-hidden' style={{ width: '11em', height: '9em' }} >
      <div style={{ width: '11em', height: '11em', marginTop: '-1em' }}>
        <Doughnut {...doughnut} />
      </div>

      <div className='absolute' style={{ top: '60%', left: '50%', transform: 'translate(-50%, -50%)' }} >
        <span className='f3'>{data[0]}</span><span className='ml1 f7'>{data[1]}{ noSpeed ? '' : '/s' }</span>
        <span className='db f7 fw5'>{title}</span>
      </div>
    </div>
  )
}
export default Speedometer
