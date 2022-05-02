import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import i18n, { localesList } from '../../../i18n'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import SpeakerIcon from '../../../icons/StrokeSpeaker'

import RetroButton from '../../common/atoms/RetroButton'
import RetroText from '../../common/atoms/RetroText'

const LanguageModal = ({ t, tReady, onLeave, link, className, isIpfsDesktop, doDesktopUpdateLanguage, ...props }) => {
  const handleClick = (lang) => {
    i18n.changeLanguage(lang)
    if (isIpfsDesktop) {
      doDesktopUpdateLanguage(lang)
    }
    onLeave()
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '25em' }}>
      <ModalBody title={t('languageModal.description')} Icon={SpeakerIcon}>
        <div className='pa2 flex flex-wrap'>
          { localesList.map((lang) =>
            <button
              key={`lang-${lang.locale}`}
              className='pa2 w-33 flex nowrap bg-transparent bn outline-0 w95fa f6 blue justify-center'
              onClick={() => handleClick(lang.locale)}>
              { lang.nativeName }
            </button>
          )}
        </div>
        <p className='lh-copy w95fa f6'>
          {t('languageModal.translationProjectIntro')}<br/>
          <a href="https://www.transifex.com/ipfs/public/" rel="noopener noreferrer" target="_blank" className="link blue">{t('languageModal.translationProjectLink')}</a>
        </p>
      </ModalBody>

      <ModalActions justify="center">
        <RetroButton width='120px' className='ma2 tc' bg='bg-gray' onClick={onLeave}>
          <RetroText>
            {t('app:actions.close')}
          </RetroText>
        </RetroButton>
      </ModalActions>
    </Modal>
  )
}

LanguageModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool
}

LanguageModal.defaultProps = {
  className: ''
}

export default connect(
  'selectIsIpfsDesktop',
  'doDesktopUpdateLanguage',
  LanguageModal
)
