import React from 'react'
import {Link} from 'react-router'

import i18n from '../utils/i18n.js'

export default function NavBar () {
  return (
    <div className='branding'>
      <Link className='navbar-brand' to='/'>
        <img src={require('../../img/logo.png')} alt='IPFS' className='img-responsive logo'/>
        <span className='sr-only'>{i18n.t('IPFS')}</span>
      </Link>
    </div>
  )
}
