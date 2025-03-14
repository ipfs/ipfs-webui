import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Modal } from '../../../components/modal/Modal.js'
import CancelIcon from '../../../icons/GlyphSmallCancel.js'

const keySymbols = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Enter: '↵',
  Space: '␣',
  Escape: 'Esc',
  Delete: 'Del',
  Backspace: '⌫',
  mac: {
    Meta: '⌘',
    Alt: '⌥',
    Shift: '⇧',
    Control: '⌃',
    Ctrl: '⌃'
  },
  other: {
    Meta: 'Win',
    Alt: 'Alt',
    Shift: 'Shift',
    Control: 'Ctrl',
    Ctrl: 'Ctrl'
  }
}

const KeyboardKey = ({ children, platform }) => {
  const getKeySymbol = (key) => {
    if (keySymbols[key]) return keySymbols[key]
    if (platform === 'mac' && keySymbols.mac[key]) return keySymbols.mac[key]
    if (platform !== 'mac' && keySymbols.other[key]) return keySymbols.other[key]
    return key
  }

  return (
    <kbd className="dib v-mid lh-solid br2 charcoal ba b--gray br2 f7 fw6 " style={{ minWidth: 'fit-content', padding: '6px', height: 'fit-content', textAlign: 'center' }}>
      {getKeySymbol(children)}
    </kbd>
  )
}

KeyboardKey.propTypes = {
  children: PropTypes.node.isRequired,
  platform: PropTypes.string.isRequired
}

const ShortcutItem = ({ shortcut, description, platform }) => (
  <div className="flex items-center justify-between pa2 bb b--black-10">
    <div className="w-60 black f7">{description}</div>
    <div className="w-40 tr">
      {Array.isArray(shortcut)
        ? shortcut.map((key, i) => (
            <React.Fragment key={i}>
              <KeyboardKey platform={platform}>{key}</KeyboardKey>
              {i < shortcut.length - 1 && <span className="mr1 gray">+</span>}
            </React.Fragment>))
        : <KeyboardKey platform={platform}>{shortcut}</KeyboardKey>}
    </div>
  </div>
)

ShortcutItem.propTypes = {
  shortcut: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]).isRequired,
  description: PropTypes.string.isRequired,
  platform: PropTypes.string.isRequired
}

const ShortcutSection = ({ title, shortcuts, platform }) => (
  <div className="mb2 ba b--black-20">
    <h3 className="f7 fw6 bb b--black-20 black pa2 ma0">{title}</h3>
    <div className="br1">
      {shortcuts.map((shortcut, i) => (
        <ShortcutItem key={i} shortcut={shortcut.shortcut} description={shortcut.description} platform={platform} />
      ))}
    </div>
  </div>
)

ShortcutSection.propTypes = {
  title: PropTypes.string.isRequired,
  shortcuts: PropTypes.array.isRequired,
  platform: PropTypes.string.isRequired
}

const ShortcutModal = ({ t, onLeave, className, ...props }) => {
  const [platform, setPlatform] = useState('other')

  // Detect platform on component mount
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
                 (navigator.userAgent.includes('Mac') && !navigator.userAgent.includes('Mobile'))
    setPlatform(isMac ? 'mac' : 'other')
  }, [])

  const navigationShortcuts = [
    { shortcut: 'ArrowDown', description: t('shortcutModal.moveDown') },
    { shortcut: 'ArrowUp', description: t('shortcutModal.moveUp') },
    { shortcut: 'ArrowLeft', description: t('shortcutModal.moveLeft') },
    { shortcut: 'ArrowRight', description: t('shortcutModal.moveRight') },
    { shortcut: 'Enter', description: t('shortcutModal.navigate') }
  ]

  const selectionShortcuts = [
    { shortcut: 'Space', description: t('shortcutModal.toggleSelection') },
    { shortcut: 'Escape', description: t('shortcutModal.deselectAll') }
  ]

  const actionShortcuts = [
    { shortcut: 'F2', description: t('shortcutModal.rename') },
    { shortcut: 'Delete', description: t('shortcutModal.delete') }
  ]

  const otherShortcuts = [
    { shortcut: ['Shift', '?'], description: t('shortcutModal.showShortcuts') }
  ]

  return (
    <Modal {...props} className={`${className} bg-near-black white`}>
      <div className="flex items-center justify-between pa2 bb b--black-20">
        <h2 className="ma0 f5 fw6 black">{t('shortcutModal.title')}</h2>
        <button
          onClick={onLeave}
          className="button-reset bn bg-transparent pa0 pointer white"
          aria-label="Close"
        >
          <CancelIcon className='pointer w2 h2 top-0 right-0 fill-gray' onClick={onLeave} />
        </button>
      </div>

      <div className="pa2 overflow-auto" style={{ maxHeight: '70vh' }}>
        <div className="flex flex-wrap">
          <div className="w-100 w-50-l pa1">
            <ShortcutSection
              title={t('shortcutModal.navigation')}
              shortcuts={navigationShortcuts}
              platform={platform}
            />

            <ShortcutSection
              title={t('shortcutModal.selection')}
              shortcuts={selectionShortcuts}
              platform={platform}
            />
          </div>

          <div className="w-100 w-50-l pa1">
            <ShortcutSection
              title={t('shortcutModal.actions')}
              shortcuts={actionShortcuts}
              platform={platform}
            />

            <ShortcutSection
              title={t('shortcutModal.other')}
              shortcuts={otherShortcuts}
              platform={platform}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

ShortcutModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  className: PropTypes.string
}

ShortcutModal.defaultProps = {
  className: ''
}

export default withTranslation('files')(ShortcutModal)
