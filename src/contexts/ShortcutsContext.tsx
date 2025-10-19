import React, { createContext, useContext, useCallback, useEffect, useRef, useMemo } from 'react'
import ShortcutModal from '../files/modals/shortcut-modal/shortcut-modal'
import Overlay from '../components/overlay/overlay'
import { t } from 'i18next'

interface Shortcut {
  id: string
  keys: string[]
  label: string
  hidden?: boolean
  action: () => void
  group?: string
  ref?: React.RefObject<HTMLElement | null>
}

interface ShortcutsContextType {
  shortcuts: Shortcut[]
  registerShortcuts: (shortcuts: Omit<Shortcut, 'id'>[]) => string[]
  unregisterShortcuts: (ids: string[]) => void
  updateShortcuts: (newShortcuts: Shortcut[]) => void
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null)

export const ShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showShortcuts, setShowShortcuts] = React.useState(false)
  const defaultShortcut: Shortcut[] = [
    {
      id: 'tour-help',
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
      id: 'ipfs-path',
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
      id: 'show-shortcuts',
      keys: ['Shift', '?'],
      label: t('app:shortcutModal.showShortcuts'),
      action: () => {
        setShowShortcuts(prev => !prev)
      },
      group: t('app:shortcutModal.general')
    }
  ]
  const [shortcuts, setShortcuts] = React.useState<Shortcut[]>(defaultShortcut)
  const registeredShortcutsRef = useRef<Map<string, Shortcut>>(new Map())

  const closeModal = () => {
    setShowShortcuts(false)
  }

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
      // Check if shortcut should be scoped to a specific ref
      if (shortcut.ref) {
        const refElement = shortcut.ref.current
        if (!refElement || !refElement.contains(target)) {
          return // Skip this shortcut if target is not within the ref scope
        }
      }

      if (isPressed(shortcut.keys, e)) {
        e.preventDefault()
        if (shortcut.id !== 'show-shortcuts') {
          closeModal()
        }
        shortcut.action()
      }
    })
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const registerShortcuts = useCallback((newShortcuts: Omit<Shortcut, 'id'>[]) => {
    const ids: string[] = []
    const shortcutsToAdd: Shortcut[] = []

    newShortcuts.forEach((shortcut, index) => {
      const id = `${shortcut.group || 'custom'}-${Date.now()}-${index}`
      ids.push(id)
      const shortcutWithId = { ...shortcut, id }
      shortcutsToAdd.push(shortcutWithId)
      registeredShortcutsRef.current.set(id, shortcutWithId)
    })

    setShortcuts(prev => [...prev, ...shortcutsToAdd])
    return ids
  }, [])

  const unregisterShortcuts = useCallback((ids: string[]) => {
    ids.forEach(id => {
      registeredShortcutsRef.current.delete(id)
    })

    setShortcuts(prev => prev.filter(shortcut => !ids.includes(shortcut.id)))
  }, [])

  return (
    <ShortcutsContext.Provider value={{
      shortcuts,
      registerShortcuts,
      unregisterShortcuts,
      updateShortcuts: useCallback((newShortcuts: Shortcut[]) => {
        setShortcuts([...defaultShortcut, ...newShortcuts])
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
    }}>
      {children}
      <div>
        <Overlay show={showShortcuts} hidden={!showShortcuts} className='' onLeave={closeModal}>
          <ShortcutModal
            className='outline-0'
            onLeave={closeModal} />
        </Overlay>
      </div>
    </ShortcutsContext.Provider>
  )
}

export const useShortcuts = (shortcuts: Omit<Shortcut, 'id'>[], ref?: React.RefObject<HTMLElement | null>) => {
  const context = useContext(ShortcutsContext)
  if (!context) {
    throw new Error('Shortcuts hook is out of context')
  }

  const memoizedShortcuts = useMemo(() =>
    shortcuts.map(shortcut => ({ ...shortcut, ref })),
  [shortcuts, ref]
  )

  useEffect(() => {
    if (memoizedShortcuts.length > 0) {
      const ids = context.registerShortcuts(memoizedShortcuts)

      return () => {
        context.unregisterShortcuts(ids)
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return context.shortcuts
}
