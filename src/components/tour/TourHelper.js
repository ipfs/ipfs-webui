import React from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'

import RetroButton from '../common/atoms/RetroButton'
import RetroText from '../common/atoms/RetroText'

export const TourHelper = ({ doEnableTours, className = '', size = 23, t }) => {
  const handleClick = () => {
    doEnableTours()
  }

  return (
    <RetroButton style={{ marginLeft: '1px' }} height='28px' width='28px' onClick={handleClick} ariaLabel={ t('startTourHelper') }>
      <RetroText fontFamily='PixM' top='-2px'>
        ?
      </RetroText>
    </RetroButton>
  )
}

export default connect(
  'doEnableTours',
  withTranslation('app')(TourHelper)
)
