/* eslint-disable space-before-function-paren */
import React, { Component, Fragment } from 'react'
import { getCurrentLanguage } from '../../lib/i18n'
import './LanguageSelector.css'
// Components
// import Overlay from '../overlay/Overlay'
// import LanguageModal from './language-modal/LanguageModal'

// import RetroButton from '../common/atoms/RetroButton'
import BlueBorderButton from '../common/atoms/BlueBorderButton'

import RetroText from '../common/atoms/RetroText'
import SectionIcon from '../../icons/retro/SectionIcon'
import ArrowDownIcon from '../../icons/retro/ArrowDownIcon'
import i18n, { localesList } from '../../i18n'
import { connect } from 'redux-bundler-react'
import { Flags } from '../../assets/images/flags/flags'
class LanguageSelector extends Component {
  state = { isLanguageModalOpen: false, hideLangModal: true }

  onLanguageEditOpen = () => {
    this.setState({ isLanguageModalOpen: !this.state.isLanguageModalOpen })
    if (!this.state.hideLangModal) {
      setTimeout(() => {
        this.setState({ hideLangModal: true })
      }, 300)
    } else {
      this.setState({ hideLangModal: false })
    }
  }

  onLanguageEditClose = () => this.setState({ isLanguageModalOpen: false })

  handleClick = (lang) => {
    i18n.changeLanguage(lang)
    if (this.props.isIpfsDesktop) {
      this.props.doDesktopUpdateLanguage(lang)
    }
    this.setState({ isLanguageModalOpen: false }, () => {
      setTimeout(() => {
        this.setState({ hideLangModal: true })
      }, 300)
    })
  }

  render() {
    // const { t } = this.props

    return (
      <Fragment>
        <div className='flex flex-column items-end'>
          <BlueBorderButton
            className="tl flex justify-between items-center pr2"
            bg='bg-teal'
            width='200px'
            onClick={this.onLanguageEditOpen}
          >
            <RetroText color='white' className='spacegrotesk'>
              <SectionIcon style={{ position: 'relative', left: '-20px', top: '-1px' }} />
              {getCurrentLanguage()}
            </RetroText>
            <ArrowDownIcon />
          </BlueBorderButton>
          <div className={`border-purple white spacegrotesk fs12 mt2 maxw320 ${this.state.hideLangModal ? 'h0' : 'hContent'} ${this.state.isLanguageModalOpen ? ' transform-none' : 'transform-foldingup'}`}>
            <div className='pa2 flex flex-wrap border-gray-purple bg-near-purple'>
              {localesList.map((lang) =>
                <button
                  key={`lang-${lang.locale}`}
                  className='pa2 lang-button-w flex nowrap bg-transparent bn outline-0 spacegrotesk fs12 white justify-start'
                  onClick={() => this.handleClick(lang.locale)}>
                  <div className="flex items-center">
                    <img src={Flags[lang.locale]} alt={lang.locale} width={24} height={24} />
                    &nbsp;&nbsp;{lang.nativeName}
                  </div>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* <Overlay show={this.state.isLanguageModalOpen} onLeave={this.onLanguageEditClose} >
          <LanguageModal className='outline-0' onLeave={this.onLanguageEditClose} t={t} />
        </Overlay> */}
      </Fragment>
    )
  }
}

export default connect(
  'selectIsIpfsDesktop',
  'doDesktopUpdateLanguage',
  LanguageSelector
)
// export default LanguageSelector
