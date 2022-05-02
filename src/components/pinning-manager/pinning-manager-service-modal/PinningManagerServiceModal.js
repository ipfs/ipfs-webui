import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import { useForm } from 'react-hook-form'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import './PinningManagerServiceModal.css'

import RetroInput from '../../common/atoms/RetroInput'
import RetroText from '../../common/atoms/RetroText'
// import RetroButton from '../../common/atoms/RetroButton'
import RetroGradientButton from '../../common/atoms/RetroGradientButton'
import FullGradientButton from '../../common/atoms/FullGradientButton'

const PinningManagerServiceModal = ({ t, onLeave, onSuccess, className, service, tReady, doAddPinningService, nickname, apiEndpoint, visitServiceUrl, secretApiKey, ...props }) => {
  const { register, errors, clearErrors, setError, handleSubmit } = useForm({
    defaultValues: {
      nickname,
      apiEndpoint,
      secretApiKey: null
    }
  })
  const inputClass = 'w-100 lh-copy f5 ph2 pv1 spacegrotesk input-reset ba b--black-20 br1 focus-outline'
  const onSubmit = async data => {
    try {
      await doAddPinningService(data)
      onSuccess()
    } catch (error) {
      console.error(error)
      setError('apiValidation', {
        type: 'manual',
        message: error.message
      })
    }
  }
  const cleanErrors = () => {
    clearErrors('apiValidation')
  }

  // const RefInput = React.forwardRef((props, ref) => (
  //   <RetroInput {...props} inputRef={ref} />
  // ))

  return (
    <Modal {...props} className={className + ' transBottomUp generic-modal spacegrotesk'} onCancel={onLeave} style={{ maxWidth: '20em' }}>
      <form onSubmit={handleSubmit(onSubmit)} onChange={cleanErrors}>
        <ModalBody
          className='textinputmodal-body white tc spacegrotesk pb2'
          title={<span style={{ width: '240px', margin: 'auto' }} fontSize={24} className='fs24 white tc spacegrotesk'> {t('pinningServiceModal.title')}</span>}
        >
          <div className='pa2 w95fa f6 flex flex-column'>
            {service.icon && service.name && (
              <>
                <label className='tl spacegrotesk gray'>
                  {t('pinningServiceModal.service')}
                </label>
                <div className="flex w-100 items-center mt2 mb3 pinning-service-list-item">
                  <img src={service.icon} alt={service.name} height={'28px'} style={{ objectFit: 'contain' }} />
                  <span className='mh2 spacegrotesk f5'>{service.name}</span>
                </div>
              </>
            )}

            <label className='tl spacegrotesk gray pb2 pt3' htmlFor="cm-nickname">
              {t('pinningServiceModal.nickname')}*
            </label>
            <div className='relative'>

              <RetroInput id='cm-nickname'
                height='41px'
                withoutShadow
                name='nickname'
                inputRef={register({ required: true })}
                type='text'
                className={classNames(inputClass, errors.nickname ? 'bg-red white' : 'charcoal')}
                placeholder={t('pinningServiceModal.nicknamePlaceholder')}
              />
              {errors.nickname && (<ErrorMsg text={t('errors.nickname')} />)}
            </div>

            <label className='tl mt4 spacegrotesk gray pb2' htmlFor="cm-apiEndpoint">
              {t('pinningServiceModal.apiEndpoint')}*
            </label>
            <div className='relative'>
              <RetroInput id='cm-apiEndpoint'
                height='41px'
                withoutShadow
                name='apiEndpoint'
                inputRef={register({ required: true, pattern: 'http(s){0,1}://.*' })}
                type='url'
                className={classNames(inputClass, errors.apiEndpoint ? 'bg-red white' : 'charcoal')}
                placeholder={t('pinningServiceModal.apiEndpointPlaceholder')}
              />
              {errors.apiEndpoint && (<ErrorMsg text={`${t('errors.apiError')}: ${t('errors.apiEndpoint')}`} />)}
            </div>

            <label className='tl mt4 spacegrotesk gray pb2' htmlFor="cm-secretApiKey">
              {t('pinningServiceModal.secretApiKey')}*
              {service.icon && service.name && visitServiceUrl && (
                <a className='f7 link pv0 lh-copy purple dib ml3' href={visitServiceUrl} rel='noopener noreferrer' target="_blank"> {t('pinningServiceModal.secretApiKeyHowToLink')}</a>
              )}
            </label>
            <div className='relative'>
              <RetroInput id='cm-secretApiKey'
                withoutShadow
                height='41px'
                inputRef={register({ required: true })}
                name='secretApiKey'
                type='password'
                autoComplete='off'
                className={classNames(inputClass, errors.secretApiKey ? 'bg-red white' : 'charcoal')}
                placeholder="••••••••••••••••••••"
              />
              {errors.secretApiKey && (<ErrorMsg text={t('errors.secretApiKey')} />)}
            </div>
          </div>
          <div>
            {errors.apiValidation && <p className='red f5 spacegrotesk ttc'>{errors.apiValidation.message}</p>}
          </div>
          <p className='spacegrotesk fs16 white pt4' style={{ maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Trans i18nKey="pinningServiceModal.description" t={t}>
              Want to make your custom pinning service available to others?
              <a href='https://docs.ipfs.io/how-to/work-with-pinning-services/' rel='noopener noreferrer' target="_blank" className='pv0 dib purple link' type='link'>Learn how.</a>
            </Trans>
          </p>
        </ModalBody>

        <ModalActions justify="center" className='flex flex-row-reverse'>
          {/* Button that actually submits the form needs to be first in HTML, that's why we reverse the order with css */}
          <FullGradientButton width='120px' height='38px' className='tc ml3' type="submit">
            <RetroText className='white'>
              {t('actions.save')}
            </RetroText>
          </FullGradientButton>
          <RetroGradientButton width='120px' height='38px' className='ma2 white tc' bg='bg-gray' onClick={onLeave}>
            <RetroText className='white'>
              {t('actions.cancel')}
            </RetroText>
          </RetroGradientButton>

        </ModalActions>
      </form>
    </Modal>
  )
}

PinningManagerServiceModal.propTypes = {
  className: PropTypes.string,
  nickname: PropTypes.string,
  apiEndpoint: PropTypes.string,
  t: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

PinningManagerServiceModal.defaultProps = {
  className: '',
  nickname: null,
  apiEndpoint: null
}

const ErrorMsg = ({ text }) => (<p className='red absolute spacegrotesk pt2 f7' style={{ top: 26, left: 2 }}>{text}</p>)

export default connect(
  'doAddPinningService',
  withTranslation('settings')(PinningManagerServiceModal)
)
