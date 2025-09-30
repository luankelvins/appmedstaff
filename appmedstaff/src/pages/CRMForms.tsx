import React, { useState } from 'react'
import { 
  Users, 
  Building2, 
  FileText, 
  UserCheck, 
  Settings,
  Star,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import ClientePFForm from '../components/CRM/ClientePFForm'
import ClientePJForm from '../components/CRM/ClientePJForm'
import IRPFForm from '../components/CRM/IRPFForm'
import { ContratoForm } from '../components/CRM/ContratoForm'
import TimeInternoForm from '../components/CRM/TimeInternoForm'
import ServicoEspecialForm from '../components/CRM/ServicoEspecialForm'
import PipelineForm from '../components/CRM/PipelineForm'
import { 
  ClientePFForm as ClientePFFormType, 
  ClientePJForm as ClientePJFormType, 
  IRPFForm as IRPFFormType,
  ContratoForm as ContratoFormType,
  TimeInternoForm as TimeInternoFormType,
  ServicoEspecialForm as ServicoEspecialFormType,
  PipelineForm as PipelineFormType
} from '../types/crm'

type FormType = 
  | 'cliente-pf' 
  | 'cliente-pj' 
  | 'irpf' 
  | 'contratos' 
  | 'time-interno' 
  | 'servicos-especiais'
  | 'captacao-pipeline'

interface FormCard {
  id: FormType
  title: string
  description: string
  icon: React.ReactNode
  category: 'Captação' | 'Operacional' | 'Gestão' | 'Especiais'
  status: 'Ativo' | 'Em desenvolvimento' | 'Planejado'
  priority: 'Alta' | 'Média' | 'Baixa'
}

const formCards: FormCard[] = [
  {
    id: 'cliente-pf',
    title: 'Captação Cliente PF',
    description: 'Formulário para captação de clientes pessoa física',
    icon: <Users className="h-6 w-6" />,
    category: 'Captação',
    status: 'Ativo',
    priority: 'Alta'
  },
  {
    id: 'cliente-pj',
    title: 'Captação Cliente PJ',
    description: 'Formulário para captação de clientes pessoa jurídica',
    icon: <Building2 className="h-6 w-6" />,
    category: 'Captação',
    status: 'Ativo',
    priority: 'Alta'
  },
  {
    id: 'irpf',
    title: 'Declaração IRPF',
    description: 'Formulário para coleta de dados para declaração de IRPF',
    icon: <FileText className="h-6 w-6" />,
    category: 'Operacional',
    status: 'Ativo',
    priority: 'Alta'
  },
  {
    id: 'contratos',
    title: 'Gestão de Contratos',
    description: 'Formulário para criação e gestão de contratos',
    icon: <FileText className="h-6 w-6" />,
    category: 'Gestão',
    status: 'Ativo',
    priority: 'Média'
  },
  {
    id: 'time-interno',
    title: 'Time Interno',
    description: 'Formulário para cadastro e gestão do time interno',
    icon: <UserCheck className="h-6 w-6" />,
    category: 'Gestão',
    status: 'Ativo',
    priority: 'Média'
  },
  {
    id: 'servicos-especiais',
    title: 'Serviços Especiais',
    description: 'Formulários para serviços especializados e parceiros',
    icon: <Star className="h-6 w-6" />,
    category: 'Especiais',
    status: 'Ativo',
    priority: 'Baixa'
  },
  {
    id: 'captacao-pipeline',
    title: 'Pipeline de Captação',
    description: 'Gestão do pipeline comercial e captação de leads',
    icon: <TrendingUp className="h-6 w-6" />,
    category: 'Captação',
    status: 'Ativo',
    priority: 'Alta'
  }
]

const CRMForms: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<FormType | 'all'>('all')
  const [showClientePFForm, setShowClientePFForm] = useState(false)
  const [showClientePJForm, setShowClientePJForm] = useState(false)
  const [showIRPFForm, setShowIRPFForm] = useState(false)
  const [showContratoForm, setShowContratoForm] = useState(false)
  const [showTimeInternoForm, setShowTimeInternoForm] = useState(false)
  const [showServicoEspecialForm, setShowServicoEspecialForm] = useState(false)
  const [showPipelineForm, setShowPipelineForm] = useState(false)

  const categories = ['Todos', 'Captação', 'Operacional', 'Gestão', 'Especiais']

  const filteredForms = formCards.filter(form => {
    const matchesCategory = selectedCategory === 'Todos' || form.category === selectedCategory
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800'
      case 'Em desenvolvimento': return 'bg-yellow-100 text-yellow-800'
      case 'Planejado': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800'
      case 'Média': return 'bg-yellow-100 text-yellow-800'
      case 'Baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleFormSelect = (formId: FormType) => {
    if (formId === 'cliente-pf') {
      setShowClientePFForm(true)
    } else if (formId === 'cliente-pj') {
      setShowClientePJForm(true)
    } else if (formId === 'irpf') {
      setShowIRPFForm(true)
    } else if (formId === 'contratos') {
      setShowContratoForm(true)
    } else if (formId === 'time-interno') {
      setShowTimeInternoForm(true)
    } else if (formId === 'servicos-especiais') {
      setShowServicoEspecialForm(true)
    } else if (formId === 'captacao-pipeline') {
      setShowPipelineForm(true)
    } else {
      // Aqui você pode implementar a navegação para o formulário específico
      console.log(`Navegando para formulário: ${formId}`)
    }
  }

  const handleClientePFSubmit = (data: ClientePFFormType) => {
    console.log('Dados do Cliente PF:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowClientePFForm(false)
  }

  const handleClientePFCancel = () => {
    setShowClientePFForm(false)
  }

  const handleClientePJSubmit = (data: ClientePJFormType) => {
    console.log('Dados do Cliente PJ:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowClientePJForm(false)
  }

  const handleClientePJCancel = () => {
    setShowClientePJForm(false)
  }

  const handleIRPFSubmit = (data: IRPFFormType) => {
    console.log('Dados do IRPF:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowIRPFForm(false)
  }

  const handleIRPFCancel = () => {
    setShowIRPFForm(false)
  }

  const handleContratoSubmit = (data: ContratoFormType) => {
    console.log('Dados do Contrato:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowContratoForm(false)
  }

  const handleContratoCancel = () => {
    setShowContratoForm(false)
  }

  const handleTimeInternoSubmit = (data: TimeInternoFormType) => {
    console.log('Dados do Time Interno:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowTimeInternoForm(false)
  }

  const handleTimeInternoCancel = () => {
    setShowTimeInternoForm(false)
  }

  const handleServicoEspecialSubmit = (data: ServicoEspecialFormType) => {
    console.log('Dados do Serviço Especial:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowServicoEspecialForm(false)
  }

  const handleServicoEspecialCancel = () => {
    setShowServicoEspecialForm(false)
  }

  const handlePipelineSubmit = (data: PipelineFormType) => {
    console.log('Dados do Pipeline:', data)
    // Aqui você implementaria a lógica para salvar os dados
    setShowPipelineForm(false)
  }

  const handlePipelineCancel = () => {
    setShowPipelineForm(false)
  }

  if (showClientePFForm) {
    return (
      <ClientePFForm
        onSubmit={handleClientePFSubmit}
        onCancel={handleClientePFCancel}
      />
    )
  }

  if (showClientePJForm) {
    return (
      <ClientePJForm
        onSubmit={handleClientePJSubmit}
        onCancel={handleClientePJCancel}
      />
    )
  }

  if (showIRPFForm) {
    return (
      <IRPFForm
        onSubmit={handleIRPFSubmit}
        onCancel={handleIRPFCancel}
      />
    )
  }

  if (showContratoForm) {
    return (
      <ContratoForm
        onSubmit={handleContratoSubmit}
        onCancel={handleContratoCancel}
      />
    )
  }

  if (showTimeInternoForm) {
    return (
      <TimeInternoForm 
        onSubmit={handleTimeInternoSubmit}
        onCancel={handleTimeInternoCancel}
      />
    )
  }

  if (showServicoEspecialForm) {
    return (
      <ServicoEspecialForm 
        onSubmit={handleServicoEspecialSubmit}
        onCancel={handleServicoEspecialCancel}
      />
    )
  }

  if (showPipelineForm) {
    return (
      <PipelineForm 
        onSubmit={handlePipelineSubmit}
        onCancel={handlePipelineCancel}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulários de CRM</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os formulários de captação e operacionais
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-medstaff-primary text-white rounded-lg hover:bg-medstaff-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Formulário
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar formulários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
          />
        </div>

        {/* Filtro por categoria */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Formulários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div 
            key={form.id} 
            className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleFormSelect(form.id)}
          >
            {/* Card Header */}
            <div className="p-6 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-medstaff-primary/10 rounded-lg text-medstaff-primary">
                    {form.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      {form.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="px-6 pb-6">
              <p className="text-gray-600 text-sm mb-4">
                {form.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                    {form.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(form.priority)}`}>
                    {form.priority}
                  </span>
                </div>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Abrir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Formulários</p>
                <p className="text-xl font-semibold">{formCards.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Formulários Ativos</p>
                <p className="text-xl font-semibold">
                  {formCards.filter(f => f.status === 'Ativo').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
                <p className="text-xl font-semibold">
                  {formCards.filter(f => f.priority === 'Alta').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-xl font-semibold">{categories.length - 1}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum formulário encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou criar um novo formulário.
          </p>
        </div>
      )}
    </div>
  )
}

export default CRMForms