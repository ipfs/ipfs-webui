import React from 'react'
import PropTypes from 'prop-types'
import i18n, { localesList } from '../../../i18n'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import SpeakerIcon from '../../../icons/StrokeSpeaker'
import Button from '../../button/Button'

const LanguageModal = ({ t, tReady, onLeave, link, className, ...props }) => {
  const handleClick = (lang) => {
    i18n.changeLanguage(lang)
    onLeave()
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '40em' }}>
      <ModalBody Icon={SpeakerIcon}>
        <p className='charcoal w-80 center'>{t('languageModal.description')}</p>
        <div className='pa2 flex flex-wrap'>
          { localesList.map((lang) =>
            <button
              key={`lang-${lang.locale}`}
              className='pa2 w-33 flex nowrap bg-transparent bn outline-0 blue justify-center'
              onClick={() => handleClick(lang.locale)}>
              { lang.nativeName }
            </button>
          )}
        </div>
        <p className='lh-copy charcoal f6'>
          {t('languageModal.translationProjectIntro')}<br/>
          <a href="https://www.transifex.com/ipfs/public/" rel="noopener noreferrer" target="_blank" className="link blue">{t('languageModal.translationProjectLink')}</a>
        </p>
      </ModalBody>

      <ModalActions justify="center">
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('app:actions.close')}</Button>
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

export default LanguageModal
