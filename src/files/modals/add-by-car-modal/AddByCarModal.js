import React from 'react'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import Modal, { ModalActions, ModalBody } from '../../../components/modal/Modal'
import Icon from '../../../icons/StrokeDecentralization.js'
import Button from '../../../components/button/button'

class AddByCarModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render () {
    const {
      t, className, onCancel, onSubmit
    } = this.props

    return (
      <Modal className={className} onCancel={onCancel}>
        <ModalBody title='Add by CAR' Icon={Icon}>
          <div className='mb3 flex flex-column items-center'>
            <p className='mt0 charcoal tl w-90'>{t('addByCarModal.description') + ' ' + t('addByCarModal.examples')}</p>
          </div>
        </ModalBody>

        <ModalActions>
          <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
          <Button className='ma2 tc' bg='bg-teal' disabled={this.isDisabled} onClick={onSubmit}>{t('app:actions.import')}</Button>
        </ModalActions>
      </Modal>
    )
  }
}

export default withTranslation('files')(AddByCarModal)
