import React from 'react'
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'

export const ConnectionStatus: React.FC = () => {
  const { status, isOnline } = useWebSocket()

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Sem conexão com a internet',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    }

    switch (status.connectionState) {
      case 'connected':
        return {
          icon: CheckCircle,
          text: 'Conectado',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'connecting':
        return {
          icon: Wifi,
          text: 'Conectando...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'disconnected':
        return {
          icon: AlertCircle,
          text: 'Desconectado',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: AlertCircle,
          text: 'Status desconhecido',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  // Só mostra o indicador se não estiver conectado
  if (status.isConnected && isOnline) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{statusInfo.text}</span>
      {status.lastError && (
        <span className="text-xs text-gray-500 ml-2" title={status.lastError}>
          ({status.lastError})
        </span>
      )}
    </div>
  )
}

export default ConnectionStatus