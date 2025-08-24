import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
// @ts-ignore
import { Modal } from '../../../components/modal/Modal'
import { useShortcuts } from '../../../contexts/ShortcutsContext'

interface KeySymbols {
  [key: string]: string | {
    [key: string]: string
  }
  mac: {
    [key: string]: string
  }
  other: {
    [key: string]: string
  }
}

const keySymbols: KeySymbols = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Enter: '↵',
  Space: 'Space',
  Escape: 'Esc',
  Delete: 'Del',
  Backspace: '⌫',
  mac: {
    Meta: '⌘',
    Alt: '⌥',
    Shift: 'Shift',
    Control: 'Ctrl',
    Ctrl: 'Ctrl'
  },
  other: {
    Meta: 'Win',
    Alt: 'Alt',
    Shift: 'Shift',
    Control: 'Ctrl',
    Ctrl: 'Ctrl'
  }
}

type PlatformType = 'mac' | 'other'

interface KeyboardKeyProps {
  children: string
  platform: PlatformType
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({ children, platform }) => {
  const getKeySymbol = (key: string): string => {
    if (keySymbols[key]) return keySymbols[key] as string
    if (platform === 'mac' && keySymbols.mac[key]) return keySymbols.mac[key]
    if (platform !== 'mac' && keySymbols.other[key]) return keySymbols.other[key]
    return key
  }

  return (
    <kbd className="dib v-mid lh-solid br2 charcoal ba b--gray br2 f7 fw6"
        style={{ minWidth: 'fit-content', padding: '6px', height: 'fit-content', textAlign: 'center' }}>
      {getKeySymbol(children)}
    </kbd>
  )
}

interface ShortcutItemProps {
  shortcut: string | string[]
  description: string
  platform: PlatformType,
  hidden?: boolean
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ shortcut, description, platform }) => (
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

interface ShortcutData {
  shortcut: string | string[]
  description: string
  hidden?: boolean
}

interface ShortcutSectionProps {
  title: string
  shortcuts: ShortcutData[]
  platform: PlatformType
}

const ShortcutSection: React.FC<ShortcutSectionProps> = ({ title, shortcuts, platform }) => (
  <div className="ba b--black-20">
    <h3 className="f7 fw6 bb b--black-20 black pa2 ma0">{title}</h3>
    <div className="br1">
      {shortcuts.filter(shortcut => !shortcut.hidden).map((shortcut, i) => (
        <ShortcutItem
          key={i}
          shortcut={shortcut.shortcut}
          description={shortcut.description}
          platform={platform}
        />
      ))}
    </div>
  </div>
)

interface ShortcutModalProps {
  onLeave: () => void
  className?: string
}

const ShortcutModal: React.FC<ShortcutModalProps> = ({ onLeave, className = '', ...props }) => {
  const [platform, setPlatform] = useState<PlatformType>('other')
  const { t } = useTranslation('app')
  const shortcuts = useShortcuts([])

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
                 (navigator.userAgent.includes('Mac') && !navigator.userAgent.includes('Mobile'))
    setPlatform(isMac ? 'mac' : 'other')
  }, [])

  const groupedShortcuts = useMemo(() => {
    return shortcuts.reduce((acc, shortcut) => {
      const group = shortcut.group || 'Other'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push({
        shortcut: shortcut.keys,
        description: shortcut.label,
        hidden: shortcut.hidden
      })
      return acc
    }, {} as Record<string, ShortcutData[]>)
  }, [shortcuts])

  const groupOrder = ['General', 'Navigation', 'Selection', 'Actions', 'Other']

  const sortedGroups = useMemo(() => {
    return Object.entries(groupedShortcuts)
      .sort(([a], [b]) => {
        const indexA = groupOrder.indexOf(a)
        const indexB = groupOrder.indexOf(b)
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedShortcuts])

  return (
    <Modal {...props} className={`${className} bg-near-black white`} onCancel={onLeave}>
      <div className="flex items-center justify-between pa2 bb b--black-20">
        <h2 className="ma0 f5 fw6 black">{t('shortcutModal.title')}</h2>
      </div>

      <div className="pa2 overflow-auto" style={{ maxHeight: '70vh' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '.5rem'
          }}
        >
          {sortedGroups.map(([group, shortcuts]) => (
            <ShortcutSection
              key={group}
              title={group}
              shortcuts={shortcuts}
              platform={platform}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default ShortcutModal
