import React, { useState } from 'react'
import { Users, Plus, Edit, Trash2, ChevronDown, ChevronRight, Grid3X3, GitBranch, X, Save, Eye } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'
import TimeInternoForm from '../../components/CRM/TimeInternoForm'
import EmployeeCard from '../../components/CRM/EmployeeCard'
import { TimeInternoForm as TimeInternoFormType } from '../../types/crm'

interface Employee {
  id: string
  name: string
  position: string
  department: string
  manager?: string
  email: string
  phone: string
  subordinates: Employee[]
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    position: 'CEO',
    department: 'Diretoria',
    email: 'joao.silva@medstaff.com',
    phone: '(11) 99999-9999',
    subordinates: [
      {
        id: '2',
        name: 'Maria Santos',
        position: 'Gerente Comercial',
        department: 'Comercial',
        manager: '1',
        email: 'maria.santos@medstaff.com',
        phone: '(11) 88888-8888',
        subordinates: [
          {
            id: '3',
            name: 'Pedro Costa',
            position: 'Analista Comercial',
            department: 'Comercial',
            manager: '2',
            email: 'pedro.costa@medstaff.com',
            phone: '(11) 77777-7777',
            subordinates: []
          }
        ]
      },
      {
        id: '4',
        name: 'Ana Oliveira',
        position: 'Gerente Operacional',
        department: 'Operacional',
        manager: '1',
        email: 'ana.oliveira@medstaff.com',
        phone: '(11) 66666-6666',
        subordinates: [
          {
            id: '5',
            name: 'Carlos Lima',
            position: 'Analista Operacional',
            department: 'Operacional',
            manager: '4',
            email: 'carlos.lima@medstaff.com',
            phone: '(11) 55555-5555',
            subordinates: []
          }
        ]
      }
    ]
  }
]

// Componente para visualização em árvore
const TreeNode: React.FC<{
  employee: Employee
  level: number
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => void
  onView: (employee: Employee) => void
  canEdit: boolean
  canDelete: boolean
  isLast?: boolean
  parentConnections?: boolean[]
}> = ({ employee, level, onEdit, onDelete, onView, canEdit, canDelete, isLast = false, parentConnections = [] }) => {
  const [isExpanded, setIsExpanded] = useState(level < 3)
  const hasSubordinates = employee.subordinates.length > 0

  // Cores baseadas no nível hierárquico
  const getCardColors = (level: number) => {
    switch (level) {
      case 0: return { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', text: 'text-white', border: 'border-purple-200' }
      case 1: return { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-white', border: 'border-blue-200' }
      case 2: return { bg: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-white', border: 'border-green-200' }
      default: return { bg: 'bg-gradient-to-br from-gray-100 to-gray-200', text: 'text-gray-800', border: 'border-gray-300' }
    }
  }

  const colors = getCardColors(level)

  return (
    <div className="relative">
      {/* Linhas de conexão melhoradas */}
      {level > 0 && (
        <>
          {/* Linha vertical do pai */}
          <div className="absolute left-6 top-0 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-400"></div>
          
          {/* Linha horizontal */}
          <div className="absolute left-6 top-8 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
          
          {/* Linhas de conexão dos pais */}
          {parentConnections.map((hasConnection, index) => (
            hasConnection && (
              <div
                key={index}
                className="absolute w-0.5 bg-gray-300"
                style={{
                  left: `${6 - (parentConnections.length - index - 1) * 48}px`,
                  top: 0,
                  height: '32px'
                }}
              />
            )
          ))}
        </>
      )}

      <div className={`flex items-start ${level > 0 ? 'ml-14' : ''} mb-6`}>
        <div className={`${colors.bg} ${colors.border} rounded-xl shadow-lg border-2 p-5 min-w-72 relative transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}>
          {/* Indicador de expansão melhorado */}
          {hasSubordinates && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-600 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-gray-200"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}

          <div className="flex items-start justify-between mb-3">
            {/* Avatar melhorado */}
            <div className="relative">
              <div className={`w-14 h-14 ${level === 0 ? 'bg-white/20' : 'bg-white/30'} rounded-full flex items-center justify-center backdrop-blur-sm`}>
                <Users className={`${level === 0 ? 'text-white' : colors.text} opacity-80`} size={24} />
              </div>
              {/* Indicador de status online */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Ações */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onView(employee)}
                className={`p-2 ${level === 0 ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/20'} rounded-lg transition-colors`}
                title="Ver detalhes"
              >
                <Eye size={16} />
              </button>
              {canEdit && (
                <button
                  onClick={() => onEdit(employee)}
                  className={`p-2 ${level === 0 ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-white/80 hover:text-white hover:bg-white/20'} rounded-lg transition-colors`}
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
              )}
              {canDelete && employee.id !== '1' && (
                <button
                  onClick={() => onDelete(employee.id)}
                  className="p-2 text-red-200 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className={`font-bold ${colors.text} text-lg mb-1`}>{employee.name}</h3>
            <p className={`text-sm ${level === 0 ? 'text-white/90' : 'text-white/80'} font-medium mb-1`}>{employee.position}</p>
            <p className={`text-xs ${level === 0 ? 'text-white/70' : 'text-white/70'} mb-3`}>{employee.department}</p>
            
            {/* Informações de contato em cards menores */}
            <div className="space-y-2">
              <div className={`${level === 0 ? 'bg-white/10' : 'bg-white/20'} rounded-lg p-2 backdrop-blur-sm`}>
                <p className={`text-xs ${colors.text} font-medium`}>{employee.email}</p>
              </div>
              <div className={`${level === 0 ? 'bg-white/10' : 'bg-white/20'} rounded-lg p-2 backdrop-blur-sm`}>
                <p className={`text-xs ${colors.text} font-medium`}>{employee.phone}</p>
              </div>
            </div>

            {/* Badge de subordinados */}
            {hasSubordinates && (
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${level === 0 ? 'bg-white/20 text-white' : 'bg-white/30 text-white'}`}>
                  {employee.subordinates.length} subordinado{employee.subordinates.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subordinados com layout melhorado */}
      {isExpanded && hasSubordinates && (
        <div className="relative">
          {/* Linha vertical principal para subordinados */}
          <div className="absolute left-6 top-0 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-400"></div>
          
          <div className="ml-14 mt-8">
            {/* Container flexível para subordinados */}
            <div className="flex flex-wrap gap-8">
              {employee.subordinates.map((subordinate, index) => {
                const isLastSubordinate = index === employee.subordinates.length - 1
                const newParentConnections = [...parentConnections, !isLastSubordinate]
                
                return (
                  <div key={subordinate.id} className="relative">
                    {/* Linha de conexão para cada subordinado */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-300"></div>
                    )}
                    
                    <TreeNode
                      employee={subordinate}
                      level={level + 1}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      isLast={isLastSubordinate}
                      parentConnections={newParentConnections}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para visualização em lista
const EmployeeListItem: React.FC<{
  employee: Employee
  level: number
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => void
  onView: (employee: Employee) => void
  canEdit: boolean
  canDelete: boolean
}> = ({ employee, level, onEdit, onDelete, onView, canEdit, canDelete }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2)

  return (
    <div className={`ml-${level * 6}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {employee.subordinates.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.position}</p>
              <p className="text-xs text-gray-500">{employee.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right text-sm">
              <p className="text-gray-600">{employee.email}</p>
              <p className="text-gray-500">{employee.phone}</p>
            </div>
            <button
              onClick={() => onView(employee)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
              title="Ver detalhes"
            >
              <Eye size={16} />
            </button>
            {canEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit size={16} />
              </button>
            )}
            {canDelete && employee.id !== '1' && (
              <button
                onClick={() => onDelete(employee.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && employee.subordinates.map(subordinate => (
        <EmployeeListItem
          key={subordinate.id}
          employee={subordinate}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  )
}

export const Organogram: React.FC = () => {
  const permissions = usePermissions()
  const [employees] = useState<Employee[]>(mockEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'compact'>('tree')
  const [formData, setFormData] = useState<Partial<TimeInternoFormType>>({})
  const [viewEmployeeData, setViewEmployeeData] = useState<TimeInternoFormType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')

  // Filtrar membros do time interno baseado na busca e departamento
  const filteredEmployees = employees.map(employee => {
    const filterEmployee = (emp: Employee): Employee | null => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment
      
      if (matchesSearch && matchesDepartment) {
        return emp
      }
      
      // Verificar subordinados recursivamente
      const filteredSubordinates = emp.subordinates
        .map(sub => filterEmployee(sub))
        .filter(Boolean) as Employee[]
      
      if (filteredSubordinates.length > 0) {
        return { ...emp, subordinates: filteredSubordinates }
      }
      
      return null
    }
    
    return filterEmployee(employee)
  }).filter(Boolean) as Employee[]

  // Obter lista de departamentos únicos
  const departments = Array.from(new Set(
    employees.flatMap(emp => getAllDepartments(emp))
  )).sort()

  function getAllDepartments(employee: Employee): string[] {
    const deps = [employee.department]
    employee.subordinates.forEach(sub => {
      deps.push(...getAllDepartments(sub))
    })
    return deps
  }

  const handleEdit = (employee: Employee) => {
    // Converter dados do employee para o formato do formulário
    setFormData({
      dadosPessoais: {
        nome: employee.name,
        emailPessoal: employee.email,
        telefone: employee.phone,
        cpf: '',
        rg: '',
        dataNascimento: '',
        estadoCivil: '',
        endereco: {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: ''
        }
      },
      dadosProfissionais: {
        cargo: employee.position,
        departamento: employee.department,
        gestorResponsavel: '',
        dataAdmissao: '',
        salario: 0,
        regime: 'clt'
      }
    })
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleView = (employee: Employee) => {
    // Converter dados do employee para o formato do EmployeeCard
    const employeeData: TimeInternoFormType = {
      dadosPessoais: {
        nome: employee.name,
        emailPessoal: employee.email,
        telefone: employee.phone,
        cpf: '000.000.000-00', // Dados fictícios para demonstração
        rg: '00.000.000-0',
        dataNascimento: '1990-01-01',
        estadoCivil: 'solteiro',
        endereco: {
          cep: '00000-000',
          logradouro: 'Rua Exemplo',
          numero: '123',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        alergias: '',
        contatoEmergencia: {
          nome: 'Contato de Emergência',
          telefone: '(11) 99999-9999',
          parentesco: 'familiar'
        }
      },
      dadosProfissionais: {
        cargo: employee.position,
        departamento: employee.department,
        gestorResponsavel: employee.manager || '',
        dataAdmissao: '2023-01-01',
        salario: 5000,
        regime: 'clt'
      },
      jornadaTrabalho: {
        escala: '5x2',
        cargaHoraria: 40,
        horarioEntrada: '08:00',
        horarioSaida: '17:00',
        intervalos: '12:00-13:00'
      },
      aso: {
        admissional: {
          data: '',
          medico: ''
        }
      },
      dependentes: [],
      dadosFinanceiros: {
        salarioBase: 0,
        beneficios: [],
        dadosBancarios: {
          banco: 'Banco do Brasil',
          agencia: '1234',
          conta: '12345-6',
          tipoConta: 'corrente',
          pix: employee.email
        }
      },
      documentos: [],
      documentosObrigatorios: [],
      anexos: [],
      anexosNotificacoes: [],
      status: 'ativo',
      responsavelRH: ''
    }
    setViewEmployeeData(employeeData)
    setIsViewModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro do time interno?')) {
      // Implementar lógica de remoção
      console.log('Removendo membro do time interno:', id)
    }
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setFormData({})
    setIsModalOpen(true)
  }

  const handleFormSubmit = (data: TimeInternoFormType) => {
    console.log('Dados do formulário:', data)
    // Implementar lógica de salvamento
    setIsModalOpen(false)
  }

  if (!permissions.canViewOrgChart()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para visualizar o organograma.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organograma</h1>
          <p className="text-gray-600">Estrutura organizacional da empresa</p>
        </div>
        
        {/* Controles superiores */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar membro do time interno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
            <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filtro por departamento */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Toggle de visualização melhorado */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização em lista"
            >
              <Grid3X3 size={16} />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização em árvore"
            >
              <GitBranch size={16} />
              <span className="hidden sm:inline">Árvore</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização compacta"
            >
              <Users size={16} />
              <span className="hidden sm:inline">Compacta</span>
            </button>
          </div>

          {permissions.canUpdateOrgChart() && (
            <button
              onClick={handleAddEmployee}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total do Time Interno</p>
              <p className="text-2xl font-bold">{employees.reduce((acc, emp) => acc + countEmployees(emp), 0)}</p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Departamentos</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
            <GitBranch className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Gerentes</p>
              <p className="text-2xl font-bold">{employees.reduce((acc, emp) => acc + countManagers(emp), 0)}</p>
            </div>
            <Users className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Níveis Hierárquicos</p>
              <p className="text-2xl font-bold">{getMaxLevel(employees[0] || null)}</p>
            </div>
            <GitBranch className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Visualização baseada no modo selecionado */}
      <div className={`${viewMode === 'tree' ? 'bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 overflow-x-auto' : 'bg-gray-50 rounded-lg p-6'}`}>
        {viewMode === 'list' ? (
          // Visualização em lista (existente)
          filteredEmployees.map(employee => (
            <EmployeeListItem
              key={employee.id}
              employee={employee}
              level={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              canEdit={permissions.canUpdateOrgChart()}
              canDelete={permissions.canDeleteOrgChart()}
            />
          ))
        ) : viewMode === 'compact' ? (
          // Visualização compacta (nova)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getAllEmployeesFlat(filteredEmployees).map(employee => (
              <div key={employee.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{employee.position}</p>
                    <p className="text-xs text-gray-500">{employee.department}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end space-x-1">
                  <button
                    onClick={() => handleView(employee)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                  >
                    <Eye size={14} />
                  </button>
                  {permissions.canUpdateOrgChart() && (
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Visualização em árvore melhorada
          <div className="flex justify-center">
            <div className="space-y-12">
              {filteredEmployees.map(employee => (
                <TreeNode
                  key={employee.id}
                  employee={employee}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  canEdit={permissions.canUpdateOrgChart()}
                  canDelete={permissions.canDeleteOrgChart()}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultados da busca */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Mostrando resultados para "{searchTerm}" - {getAllEmployeesFlat(filteredEmployees).length} membro(s) encontrado(s)
        </div>
      )}

      {/* Modal para adicionar/editar membro do time interno usando TimeInternoForm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedEmployee ? 'Editar Membro do Time Interno' : 'Adicionar Membro do Time Interno'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <TimeInternoForm
               onSubmit={handleFormSubmit}
               onCancel={() => setIsModalOpen(false)}
             />
          </div>
        </div>
      )}

      {/* Modal para visualizar detalhes do membro do time interno usando EmployeeCard */}
      {isViewModalOpen && viewEmployeeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Detalhes do Membro do Time Interno</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <EmployeeCard employee={viewEmployeeData} />
          </div>
        </div>
      )}
    </div>
  )
}

// Funções auxiliares
function countEmployees(employee: Employee): number {
  return 1 + employee.subordinates.reduce((acc, sub) => acc + countEmployees(sub), 0)
}

function countManagers(employee: Employee): number {
  const isManager = employee.subordinates.length > 0 ? 1 : 0
  return isManager + employee.subordinates.reduce((acc, sub) => acc + countManagers(sub), 0)
}

function getMaxLevel(employee: Employee | null, currentLevel = 1): number {
  if (!employee || employee.subordinates.length === 0) return currentLevel
  return Math.max(...employee.subordinates.map(sub => getMaxLevel(sub, currentLevel + 1)))
}

function getAllEmployeesFlat(employees: Employee[]): Employee[] {
  const result: Employee[] = []
  
  function traverse(emp: Employee) {
    result.push(emp)
    emp.subordinates.forEach(traverse)
  }
  
  employees.forEach(traverse)
  return result
}