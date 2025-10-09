import React, { createContext, useContext, ReactNode } from 'react'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/UI/Toast'

interface ToastContextType {
  success: (message: string) => string
  error: (message: string) => string
  info: (message: string) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, removeToast, success, error, info } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext deve ser usado dentro de um ToastProvider')
  }
  return context
}