import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import i18n from '../../i18n'

// Components
import { Modal, ModalBody, ModalActions } from '../../components/modal/Modal'
import EditIcon from '../../icons/StrokePencil'
import Button from '../../components/button/Button'

const LanguageModal = ({ t, tReady, onLeave, link, className, ...props }) => {
  console.log(i18n)

  const handleClick = (lang) => {
    i18n.changeLanguage(lang)
    onLeave()
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} >
      <ModalBody title={t('languageModal.title')} icon={EditIcon}>
        <p className='gray w-80 center'>{t('languageModal.description')}</p>
        <div className='flex center w-100 pa2'>
          { i18n.languages.map((lang) =>
            <button
              key={`lang-${lang}`}
              className='ma1 bn outline-0 aqua pointer'
              onClick={() => handleClick(lang)}>
              { lang }
            </button>
          )}
        </div>
      </ModalBody>

      <ModalActions>
        <Button className='ma2' bg='bg-gray' onClick={onLeave}>{t('actions.close')}</Button>
      </ModalActions>
    </Modal>
  )
}

LanguageModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

LanguageModal.defaultProps = {
  className: ''
}

export default translate('settings')(LanguageModal)
