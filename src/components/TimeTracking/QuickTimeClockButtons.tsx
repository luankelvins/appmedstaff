import React, { useState, useEffect } from 'react'
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { timeTrackingService } from '../../services/timeTrackingService'
import { TimeEntryFilter } from '../../types/timeTracking'
import { toast } from 'react-hot-toast'

interface QuickTimeClockButtonsProps {
  className?: string
}

export const QuickTimeClockButtons: React.FC<QuickTimeClockButtonsProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<'clocked_in' | 'clocked_out' | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadCurrentStatus()
    }
  }, [user?.id])

  const loadCurrentStatus = async () => {
    if (!user?.id) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const filter: TimeEntryFilter = {
        employeeIds: [user.id],
        dateFrom: today,
        dateTo: today
      }
      
      const entries = await timeTrackingService.getTimeEntries(filter)
      
      if (entries.length === 0) {
        setCurrentStatus('clocked_out')
        return
      }

      // Pegar a entrada de hoje
      const todayEntry = entries[0]
      
      // Se tem clockIn mas não tem clockOut, está trabalhando
      if (todayEntry.clockIn && !todayEntry.clockOut) {
        setCurrentStatus('clocked_in')
      } else {
        setCurrentStatus('clocked_out')
      }
    } catch (error) {
      console.error('Erro ao carregar status atual:', error)
      setCurrentStatus('clocked_out')
    }
  }

  const handleClockIn = async () => {
    if (!user?.id || isLoading) return

    setIsLoading(true)
    try {
      await timeTrackingService.clockIn({
        employeeId: user.id,
        timestamp: new Date().toISOString(),
        notes: 'Entrada via header'
      })
      
      setCurrentStatus('clocked_in')
      toast.success('Entrada registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
      toast.error('Erro ao registrar entrada')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!user?.id || isLoading) return

    setIsLoading(true)
    try {
      await timeTrackingService.clockOut({
        employeeId: user.id,
        timestamp: new Date().toISOString(),
        notes: 'Saída via header'
      })
      
      setCurrentStatus('clocked_out')
      toast.success('Saída registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      toast.error('Erro ao registrar saída')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {currentStatus === 'clocked_out' ? (
        <button
          onClick={handleClockIn}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          title="Registrar Entrada"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Entrada</span>
        </button>
      ) : (
        <button
          onClick={handleClockOut}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          title="Registrar Saída"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Saída</span>
        </button>
      )}
      
      {/* Status indicator */}
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span className="hidden md:inline">
          {currentStatus === 'clocked_in' ? 'Trabalhando' : 'Fora do expediente'}
        </span>
      </div>
    </div>
  )
}