import React, { createContext, useContext, useCallback, useEffect } from 'react'
import ShortcutModal from '../files/modals/shortcut-modal/shortcut-modal'
// @ts-ignore
import Overlay from '../components/overlay/Overlay.js'
import { TFunction } from 'i18next'

interface Shortcut {
  keys: string[]
  label: string
  hidden?: boolean
  action: () => void
  group?: string
}

interface ShortcutsContextType {
  shortcuts: Shortcut[]
  updateShortcuts: (newShortcuts: Shortcut[]) => void
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null)

export const ShortcutsProvider: React.FC<{ children: React.ReactNode, t: TFunction }> = ({ children, t }) => {
  const [showShortcuts, setShowShortcuts] = React.useState(false)
  const defaultShortcut: Shortcut[] = [
    {
      keys: ['Shift', 'H'],
      label: t('app:shortcutModal.tourHelp'),
      action: () => {
        const tourHelper = document.getElementById('tour-helper')
        if (tourHelper) {
          tourHelper.click()
        }
      },
      group: t('app:shortcutModal.general')
    },
    {
      keys: ['/'],
      label: t('app:shortcutModal.ipfsPath'),
      action: () => {
        const ipfsPath = document.getElementById('ipfs-path')
        if (ipfsPath) {
          ipfsPath.focus()
        }
      },
      group: t('app:shortcutModal.general')
    },
    {
      keys: ['Shift', '?'],
      label: t('app:shortcutModal.showShortcuts'),
      action: () => {
        setShowShortcuts(prev => !prev)
      },
      group: t('app:shortcutModal.general')
    }
  ]
  const [shortcuts, setShortcuts] = React.useState<Shortcut[]>(defaultShortcut)

  const isPressed = (keys: string[], e: KeyboardEvent) => {
    return keys.every(key => {
      switch (key.toLowerCase()) {
        case 'shift':
          return e.shiftKey
        case 'ctrl':
          return e.ctrlKey
        case 'alt':
          return e.altKey
        case 'meta':
          return e.metaKey
        case 'space':
          return e.key === ' '
        default:
          return e.key === key
      }
    })
  }

  const hash = window.location.hash

  useEffect(() => {
    setShortcuts(defaultShortcut)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if ((target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.tagName === 'SELECT') &&
        target.closest('.modal')) return

    if ((document.activeElement?.tagName === 'INPUT' &&
         (document.activeElement as HTMLInputElement).type !== 'checkbox') ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable) {
      return
    }

    shortcuts.forEach(shortcut => {
      if (isPressed(shortcut.keys, e)) {
        e.preventDefault()
        shortcut.action()
      }
    })
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <ShortcutsContext.Provider value={{
      shortcuts,
      updateShortcuts: (newShortcuts: Shortcut[]) => setShortcuts([...defaultShortcut, ...newShortcuts])
    }}>
      {children}
      <div>
        <Overlay show={showShortcuts} hidden={!showShortcuts} className='' onLeave={() => setShowShortcuts(false)}>
          <ShortcutModal
            className='outline-0'
            onLeave={() => setShowShortcuts(false)} />
        </Overlay>
      </div>
    </ShortcutsContext.Provider>
  )
}

export const useShortcuts = (shortcuts?: Shortcut[]) => {
  const context = useContext(ShortcutsContext)
  if (!context) {
    throw new Error('useShortcuts must be used within a ShortcutsProvider')
  }

  useEffect(() => {
    if (shortcuts) {
      context.updateShortcuts(shortcuts)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return context.shortcuts
}
