import React from 'react'

const IpldGraph = ({className, root, links}) => {
  const cls = `tc ma4 ${className}`
  return (
    <div className={cls}>
      <svg width='167' height='217' viewBox='0 0 167 217' xmlns='http://www.w3.org/2000/svg'>
        <g fill='none' fillRule='evenodd'>
          <g transform='translate(68 74)'>
            <path d='M15.5.5V96' stroke='#979797' strokeWidth='2' strokeLinecap='square' strokeDasharray='1,4' />
            <g transform='translate(10 98)' stroke='#979797'>
              <rect x='.5' y='.5' width='10' height='10' rx='2' />
              <g strokeLinecap='square'>
                <path d='M5.5 3.5v4M3.5 5.5h4' />
              </g>
            </g>
            <circle fill='#28CA9F' cx='15.5' cy='127.5' r='15.5' />
          </g>
          <g transform='translate(0 71)'>
            <circle fill='#28CA9F' cx='15.5' cy='130.5' r='15.5' />
            <g transform='translate(10 101)' stroke='#979797'>
              <rect x='.5' y='.5' width='10' height='10' rx='2' />
              <g strokeLinecap='square'>
                <path d='M5.5 3.5v4M3.5 5.5h4' />
              </g>
            </g>
            <path d='M15.5 97.5V33.906S15.5.5 52.5.5' stroke='#979797' strokeWidth='2' strokeLinecap='square' strokeDasharray='1,4' />
          </g>
          <g transform='translate(114 71)'>
            <circle fill='#28CA9F' cx='37.5' cy='130.5' r='15.5' />
            <g transform='translate(32 101)' stroke='#979797'>
              <rect x='.5' y='.5' width='10' height='10' rx='2' />
              <g strokeLinecap='square'>
                <path d='M5.5 3.5v4M3.5 5.5h4' />
              </g>
            </g>
            <path d='M37.5 97.5V33.906S37.5.5.5.5' stroke='#979797' strokeWidth='2' strokeLinecap='square' strokeDasharray='1,4' />
          </g>
          <g transform='translate(68)'>
            <circle fill='#28CA9F' cx='15.5' cy='15.5' r='15.5' />
            <path d='M15.5 34.5v37' stroke='#979797' strokeWidth='2' strokeLinecap='square' strokeDasharray='1,4' />
          </g>
          <path d='M52.5 71.5H117' stroke='#979797' strokeWidth='2' strokeLinecap='square' strokeDasharray='1,4' />
        </g>
      </svg>
    </div>
  )
}

export default IpldGraph
