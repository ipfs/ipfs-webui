import React, { Fragment, useState } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Button from '../button/Button'
import { CliTutorialModal } from '../cli-tutor-mode/CliTutorMode'
import StrokeCode from '../../icons/StrokeCode'
import Overlay from '../overlay/Overlay'
import { cliCmdKeys, cliCommandList } from '../../bundles/files/consts'

const ApiAddressForm = ({ t, doUpdateIpfsApiAddress, ipfsApiAddress = '', isCliTutorModeEnabled }) => {
  const [value, setValue] = useState(ipfsApiAddress)
  const [isCliTutorModalOpen, setCliTutorModal] = useState(false)

  const onChange = (event) => setValue(event.target.value)

  const onSubmit = async (event) => {
    event.preventDefault()
    doUpdateIpfsApiAddress(value)
  }

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit(event)
    }
  }

  const showCliTutorIcon = () => {
    if (isCliTutorModeEnabled) {
      return (<Fragment>
        <StrokeCode onClick={setCliTutorModal} className='dib fill-link pointer mh2' style={{ height: 44 }}/>
        <Overlay show={isCliTutorModalOpen} onLeave={() => setCliTutorModal(false)}>
          <CliTutorialModal onLeave={() => setCliTutorModal(!isCliTutorModalOpen)} command={cliCommandList[cliCmdKeys.UPDATE_API_SERVER_ADDRESS]()} t={t} />
        </Overlay>
      </Fragment>)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor='api-address' className='db f7 mb2 ttu tracked charcoal pl1'>{t('apiAddressForm.apiLabel')}</label>
      <input id='api-address'
        type='text'
        className='w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 focus-outline'
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value} />
      <div className='tr flex justify-end items-center'>
        { showCliTutorIcon() }
        <Button className="tc">{t('apiAddressForm.submitButton')}</Button>
      </div>
    </form>
  )
}

export default connect(
  'doUpdateIpfsApiAddress',
  'selectIpfsApiAddress',
  'selectIsCliTutorModeEnabled',
  withTranslation('welcome')(ApiAddressForm)
)
