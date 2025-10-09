import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description?: string
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts)

  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      )
    })

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault()
      }
      matchingShortcut.action()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Shortcuts comuns do sistema
export const COMMON_SHORTCUTS = {
  SAVE: { key: 's', ctrlKey: true, description: 'Salvar' },
  NEW: { key: 'n', ctrlKey: true, description: 'Novo' },
  EDIT: { key: 'e', ctrlKey: true, description: 'Editar' },
  DELETE: { key: 'Delete', description: 'Excluir' },
  SEARCH: { key: 'f', ctrlKey: true, description: 'Buscar' },
  ESCAPE: { key: 'Escape', description: 'Cancelar' },
  ENTER: { key: 'Enter', description: 'Confirmar' },
  TAB: { key: 'Tab', description: 'Próximo campo' },
  SHIFT_TAB: { key: 'Tab', shiftKey: true, description: 'Campo anterior' }
}
