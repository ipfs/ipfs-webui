import React, { Component, Fragment } from 'react'
import { getCurrentLanguage } from '../../lib/i18n.js'

// Components
import Button from '../button/Button.js'
import Overlay from '../overlay/Overlay.js'
import LanguageModal from './language-modal/LanguageModal.js'

class LanguageSelector extends Component {
  state = { isLanguageModalOpen: false }

  onLanguageEditOpen = () => this.setState({ isLanguageModalOpen: true })

  onLanguageEditClose = () => this.setState({ isLanguageModalOpen: false })

  render () {
    const { t } = this.props

    return (
      <Fragment>
        <div className='flex'>
          <div className='pr4 flex items-center lh-copy charcoal f5 fw5 e2e-languageSelector-current' style={{ height: 40 }}>
            {getCurrentLanguage()}
          </div>
          <Button className="tc e2e-languageSelector-changeBtn" bg='bg-teal' minWidth={100} onClick={this.onLanguageEditOpen}>
            {t('app:actions.change')}
          </Button>
        </div>

        <Overlay show={this.state.isLanguageModalOpen} onLeave={this.onLanguageEditClose} >
          <LanguageModal className='outline-0 e2e-languageModal' onLeave={this.onLanguageEditClose} t={t} />
        </Overlay>
      </Fragment>
    )
  }
}

export default LanguageSelector
