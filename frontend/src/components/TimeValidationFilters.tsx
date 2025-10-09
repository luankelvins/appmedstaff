import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  Users, 
  Building, 
  AlertTriangle, 
  Filter,
  Search,
  ChevronDown,
  Check
} from 'lucide-react'
import {
  ValidationFilter,
  TimeIrregularity,
  IRREGULARITY_TYPES
} from '../types/timeValidation'

interface TimeValidationFiltersProps {
  filters: ValidationFilter
  onFiltersChange: (filters: ValidationFilter) => void
  onClose: () => void
  isOpen: boolean
}

interface Department {
  id: string
  name: string
  employeeCount: number
}

interface Employee {
  id: string
  name: string
  cpf: string
  department: string
  position: string
}

const TimeValidationFilters: React.FC<TimeValidationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen
}) => {
  const [localFilters, setLocalFilters] = useState<ValidationFilter>(filters)
  const [searchEmployee, setSearchEmployee] = useState('')
  const [searchDepartment, setSearchDepartment] = useState('')
  
  // Dados mockados para demonstração
  const departments: Department[] = [
    { id: 'tech', name: 'Tecnologia', employeeCount: 15 },
    { id: 'hr', name: 'Recursos Humanos', employeeCount: 8 },
    { id: 'sales', name: 'Vendas', employeeCount: 12 },
    { id: 'finance', name: 'Financeiro', employeeCount: 6 },
    { id: 'marketing', name: 'Marketing', employeeCount: 10 },
    { id: 'operations', name: 'Operações', employeeCount: 20 }
  ]

  const employees: Employee[] = [
    { id: 'emp1', name: 'João Silva', cpf: '123.456.789-00', department: 'Tecnologia', position: 'Desenvolvedor' },
    { id: 'emp2', name: 'Maria Santos', cpf: '987.654.321-00', department: 'Recursos Humanos', position: 'Analista' },
    { id: 'emp3', name: 'Carlos Oliveira', cpf: '456.789.123-00', department: 'Vendas', position: 'Consultor' },
    { id: 'emp4', name: 'Ana Costa', cpf: '789.123.456-00', department: 'Financeiro', position: 'Contador' },
    { id: 'emp5', name: 'Pedro Almeida', cpf: '321.654.987-00', department: 'Marketing', position: 'Designer' },
    { id: 'emp6', name: 'Lucia Ferreira', cpf: '654.987.321-00', department: 'Operações', position: 'Supervisor' }
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
    { value: 'corrected', label: 'Corrigido', color: 'bg-blue-100 text-blue-800' }
  ]

  // Filtrar departamentos baseado na busca
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchDepartment.toLowerCase())
  )

  // Filtrar funcionários baseado na busca
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.cpf.includes(searchEmployee) ||
    emp.position.toLowerCase().includes(searchEmployee.toLowerCase())
  )

  // Atualizar filtros locais quando os filtros externos mudarem
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Aplicar filtros
  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  // Limpar filtros
  const handleClearFilters = () => {
    const clearedFilters: ValidationFilter = {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      departments: [],
      employees: [],
      status: [],
      irregularityTypes: [],
      showOnlyWithIrregularities: false
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  // Filtros rápidos predefinidos
  const quickFilters = [
    {
      name: 'Hoje',
      action: () => {
        const today = new Date().toISOString().split('T')[0]
        setLocalFilters(prev => ({ ...prev, startDate: today, endDate: today }))
      }
    },
    {
      name: 'Esta Semana',
      action: () => {
        const today = new Date()
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
        setLocalFilters(prev => ({
          ...prev,
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: endOfWeek.toISOString().split('T')[0]
        }))
      }
    },
    {
      name: 'Este Mês',
      action: () => {
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        setLocalFilters(prev => ({
          ...prev,
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        }))
      }
    },
    {
      name: 'Apenas Pendentes',
      action: () => {
        setLocalFilters(prev => ({ ...prev, status: ['pending'] }))
      }
    },
    {
      name: 'Com Irregularidades',
      action: () => {
        setLocalFilters(prev => ({ ...prev, showOnlyWithIrregularities: true }))
      }
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Filtros Avançados</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Filtros Rápidos */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Filtros Rápidos</h3>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    onClick={filter.action}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Período */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Período
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.status.includes(status.value as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalFilters(prev => ({
                            ...prev,
                            status: [...prev.status, status.value as any]
                          }))
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            status: prev.status.filter(s => s !== status.value)
                          }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Departamentos */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Departamentos
              </h3>
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar departamento..."
                    value={searchDepartment}
                    onChange={(e) => setSearchDepartment(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredDepartments.map((dept) => (
                  <label key={dept.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.departments.includes(dept.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLocalFilters(prev => ({
                              ...prev,
                              departments: [...prev.departments, dept.name]
                            }))
                          } else {
                            setLocalFilters(prev => ({
                              ...prev,
                              departments: prev.departments.filter(d => d !== dept.name)
                            }))
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{dept.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{dept.employeeCount} funcionários</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Funcionários */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Funcionários
              </h3>
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar funcionário..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredEmployees.map((emp) => (
                  <label key={emp.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.employees.includes(emp.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalFilters(prev => ({
                            ...prev,
                            employees: [...prev.employees, emp.id]
                          }))
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            employees: prev.employees.filter(e => e !== emp.id)
                          }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-2">
                      <div className="text-sm text-gray-700">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.department} • {emp.position}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipos de Irregularidades */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Tipos de Irregularidades
              </h3>
              <div className="space-y-2">
                {Object.entries(IRREGULARITY_TYPES).map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.irregularityTypes.includes(key as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocalFilters(prev => ({
                            ...prev,
                            irregularityTypes: [...prev.irregularityTypes, key as any]
                          }))
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            irregularityTypes: prev.irregularityTypes.filter(t => t !== key)
                          }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Opções Adicionais */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Opções Adicionais</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.showOnlyWithIrregularities}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    showOnlyWithIrregularities: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mostrar apenas registros com irregularidades
                </span>
              </label>
            </div>
          </div>

          {/* Rodapé */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Limpar Filtros
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeValidationFilters