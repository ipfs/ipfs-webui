import React, { createContext, useContext, useCallback, useEffect } from 'react'
import ShortcutModal from '../files/modals/shortcut-modal/shortcut-modal'
import Overlay from '../components/overlay/Overlay'
import { TFunction } from 'i18next'

interface Shortcut {
  keys: string[]
  label: string
  action: () => void
  group?: string
}

interface ShortcutsContextType {
  shortcuts: Shortcut[]
  updateShortcuts: (newShortcuts: Shortcut[]) => void
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null)

export const ShortcutsProvider: React.FC<{ children: React.ReactNode, t: TFunction }> = ({ children, t }) => {
  const defaultShortcut: Shortcut[] = [
    {
      keys: ['Shift', '?'],
      label: t('shortcutModal.showShortcuts'),
      action: () => {},
      group: t('shortcutModal.other')
    }
  ]
  const [shortcuts, setShortcuts] = React.useState<Shortcut[]>(defaultShortcut)
  const [showShortcuts, setShowShortcuts] = React.useState(false)

  shortcuts[0].action = () => setShowShortcuts(prev => !prev)

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
        default:
          return e.key === key
      }
    })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if ((target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.tagName === 'SELECT') &&
        target.closest('.modal')) return

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

export const useShortcuts = () => {
  const context = useContext(ShortcutsContext)
  if (!context) {
    throw new Error('useShortcuts must be used within a ShortcutsProvider')
  }
  return context
}
