import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string) => {
    return addToast(message, 'success')
  }, [addToast])

  const error = useCallback((message: string) => {
    return addToast(message, 'error')
  }, [addToast])

  const info = useCallback((message: string) => {
    return addToast(message, 'info')
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info
  }
}