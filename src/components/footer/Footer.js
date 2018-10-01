import React from 'react'
import PropTypes from 'prop-types'

const Footer = ({
  t,
  codeUrl,
  bugsUrl = `${codeUrl}/issues`
}) => {
  return (
    <footer className='flex justify-between pv2 bt b--silver'>
      <a href={codeUrl} className='flex-none link glow o-70 f6 charcoal'>
        <svg className='fill-current-color v-mid' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16'><path d='M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z ' /></svg>
        <span className='ph1'>{t('codeLink')}</span>
      </a>
      <a href={bugsUrl} className='flex-none link glow o-70 f6 charcoal'>
        <span className='ph1'>{t('bugsLink')}</span>
        <svg className='fill-current-color v-mid' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16'><path d='M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z ' /></svg>
      </a>
    </footer>
  )
}

Footer.propTypes = {
  codeUrl: PropTypes.string.isRequired,
  bugsUrl: PropTypes.string
}

export default Footer
