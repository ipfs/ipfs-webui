import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import { useForm } from 'react-hook-form'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import Button from '../../button/Button'
import './PinningManagerServiceModal.css'

const PinningManagerServiceModal = ({ t, onLeave, className, service, tReady, doAddPinningService, ...props }) => {
  const { register, errors, handleSubmit } = useForm()
  const inputClass = 'w-100 lh-copy f5 ph2 pv1 input-reset ba b--black-20 br1 focus-outline'
  const onSubmit = data => doAddPinningService(data)

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <p>{ t('pinningServiceModal.title') }</p>

          <div className='pa2 pinningManagerServiceModalContainer'>
            { service.icon && service.name && (
              <>
                <label>
                  { t('pinningServiceModal.service') }
                </label>
                <div className="flex w-100 items-center">
                  <img className="mr3" src={service.icon} alt={service.name} height={42} style={{ objectFit: 'contain' }} />
                  <span>{ service.name }</span>
                </div>
              </>
            )}

            <label htmlFor="cm-nickname">
              { t('pinningServiceModal.nickname') }
            </label>
            <div className='relative'>
              <input id='cm-nickname'
                name='nickname'
                ref={ register({ required: true }) }
                type='text'
                className={ classNames(inputClass, errors.nickname ? 'bg-red white' : 'charcoal') }
                placeholder={ t('pinningServiceModal.nicknamePlaceholder') }
              />
              {errors.nickname && (<ErrorMsg text={ t('errors.nickname') }/>)}
            </div>

            <label htmlFor="cm-apiEndpoint">
              { t('pinningServiceModal.apiEndpoint') }
            </label>
            <div className='relative'>
              <input id='cm-apiEndpoint'
                name='apiEndpoint'
                ref={ register({ required: true, pattern: 'http(s){0,1}://.*' }) }
                type='url'
                className={ classNames(inputClass, errors.apiEndpoint ? 'bg-red white' : 'charcoal') }
                placeholder={ t('pinningServiceModal.apiEndpointPlaceholder') }
              />
              {errors.apiEndpoint && (<ErrorMsg text={ t('errors.apiEndpoint') }/>)}
            </div>

            <label htmlFor="cm-secretApiKey">
              { t('pinningServiceModal.secretApiKey') }
            </label>
            <div className='relative'>
              <input id='cm-secretApiKey'
                ref={ register({ required: true }) }
                name='secretApiKey'
                type='password'
                autoComplete='off'
                className={ classNames(inputClass, errors.secretApiKey ? 'bg-red white' : 'charcoal') }
                placeholder="••••••••••••••••••••"
              />
              {errors.secretApiKey && (<ErrorMsg text={ t('errors.secretApiKey') }/>)}
            </div>

          </div>
          <p className='f6'>
            <Trans i18nKey="pinningServiceModal.description" t={t}>
              Want to make your custom pinning service available to others?
              <a href='https://docs.ipfs.io/how-to/work-with-pinning-services/' rel='noopener noreferrer' target="_blank" className='pv0' type='link'>Learn how.</a>
            </Trans>
          </p>
        </ModalBody>

        <ModalActions justify="center" className='flex flex-row-reverse'>
          {/* Button that actually submits the form needs to be first in HTML, that's why we reverse the order with css */}
          <Button className='ma2 tc' type="submit">{t('actions.save')}</Button>
          <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('actions.cancel')}</Button>
        </ModalActions>
      </form>
    </Modal>
  )
}

PinningManagerServiceModal.propTypes = {
  t: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired
}

PinningManagerServiceModal.defaultProps = {
  className: ''
}

const ErrorMsg = ({ text }) => (<p className='danger absolute f7' style={{ top: 26, left: 2 }}>{text}</p>)

export default connect(
  'doAddPinningService',
  withTranslation('settings')(PinningManagerServiceModal)
)
