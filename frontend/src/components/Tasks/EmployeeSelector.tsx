import React, { useState, useEffect } from 'react'
import { employeeService, EmployeeOption } from '../../utils/employeeService'

interface EmployeeSelectorProps {
  value?: string
  onChange: (employeeId: string) => void
  placeholder?: string
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  value,
  onChange,
  placeholder = "Selecione um responsável",
  multiple = false,
  className = "",
  disabled = false
}) => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const options = await employeeService.getEmployeeOptions()
      setEmployees(options)
    } catch (err) {
      console.error('Erro ao carregar employees:', err)
      setError('Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value)
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Carregando funcionários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {error}
        <button 
          onClick={loadEmployees}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      className={`
        block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:outline-none focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <option value="">{placeholder}</option>
      {employees.map((employee) => (
        <option key={employee.value} value={employee.value}>
          {employee.label} {employee.cargo && `- ${employee.cargo}`}
        </option>
      ))}
    </select>
  )
}

// Componente para seleção múltipla de participantes
interface MultipleEmployeeSelectorProps {
  value?: string[]
  onChange: (employeeIds: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxSelections?: number
}

export const MultipleEmployeeSelector: React.FC<MultipleEmployeeSelectorProps> = ({
  value = [],
  onChange,
  placeholder = "Selecione participantes",
  className = "",
  disabled = false,
  maxSelections
}) => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const options = await employeeService.getEmployeeOptions()
      setEmployees(options)
    } catch (err) {
      console.error('Erro ao carregar employees:', err)
      setError('Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEmployee = (employeeId: string) => {
    if (value.includes(employeeId)) {
      onChange(value.filter(id => id !== employeeId))
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return // Não permite mais seleções
      }
      onChange([...value, employeeId])
    }
  }

  const getSelectedEmployeesText = () => {
    if (value.length === 0) return placeholder
    if (value.length === 1) {
      const employee = employees.find(emp => emp.value === value[0])
      return employee?.label || 'Funcionário selecionado'
    }
    return `${value.length} funcionários selecionados`
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Carregando funcionários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {error}
        <button 
          onClick={loadEmployees}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          flex items-center justify-between
        `}
      >
        <span className={value.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
          {getSelectedEmployeesText()}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {employees.map((employee) => (
            <label
              key={employee.value}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(employee.value)}
                onChange={() => handleToggleEmployee(employee.value)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {employee.label}
                </div>
                {employee.cargo && (
                  <div className="text-xs text-gray-500">
                    {employee.cargo}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}