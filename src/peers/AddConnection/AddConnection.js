import React from 'react'
import { translate } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import toUri from 'multiaddr-to-uri'

import Icon from '../../icons/StrokeDecentralization'
import Button from '../../components/button/Button'
import Overlay from '../../components/overlay/Overlay'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

class AddConnection extends React.Component {
  state = {
    open: false
  }

  toggleModal = () => {
    this.setState({
      open: !this.state.open
    })
  }

  addConnection = (maddr) => {
    this.props.doConnectSwarm(maddr)
    this.toggleModal()
  }

  validate = (maddr) => {
    try {
      toUri(maddr)
      return true
    } catch (_) {
      return false
    }
  }

  render () {
    const { open } = this.state
    const { t } = this.props

    return (
      <div>
        <Button onClick={this.toggleModal} minWidth='160px' className='pointer bg-green white f6'>+ {t('addConnection')}</Button>

        <Overlay show={open} onLeave={this.toggleModal}>
          <TextInputModal
            validate={this.validate}
            onSubmit={this.addConnection}
            onCancel={this.toggleModal}
            submitText={t('add')}
            icon={Icon}
            title={t('addConnection')}
            description={t('insertSwarmAddress')}
          />
        </Overlay>
      </div>
    )
  }
}

export default connect('doConnectSwarm', translate('peers')(AddConnection))
