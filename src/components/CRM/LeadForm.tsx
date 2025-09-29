import React, { useState, useEffect } from 'react'
import { 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin,
  CheckCircle, 
  AlertCircle,
  X,
  Save,
  UserPlus,
  Building2,
  FileEdit,
  FileText,
  Percent,
  Stethoscope,
  TrendingUp,
  Home,
  RefreshCw,
  Shield,
  HeartHandshake
} from 'lucide-react'
import { LeadForm as LeadFormType, ProdutoMedStaff, PRODUTOS_MEDSTAFF, ESTADOS_BRASIL } from '../../types/crm'

// Mapeamento de ícones para os produtos
const iconMap: Record<string, React.ComponentType<any>> = {
  'Building2': Building2,
  'FileEdit': FileEdit,
  'FileText': FileText,
  'Percent': Percent,
  'Stethoscope': Stethoscope,
  'TrendingUp': TrendingUp,
  'Home': Home,
  'Hospital': Building2, // Usando Building2 como substituto
  'RefreshCw': RefreshCw,
  'Shield': Shield,
  'HeartHandshake': HeartHandshake
}

interface LeadFormProps {
  initialData?: Partial<LeadFormType>
  onSubmit: (data: LeadFormType) => void
  onCancel: () => void
  isInternal?: boolean // Para distinguir se é preenchimento interno ou externo
}

const LeadForm: React.FC<LeadFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isInternal = false
}) => {
  const [formData, setFormData] = useState<LeadFormType>({
    nome: '',
    telefone: '',
    email: '',
    empresa: '',
    cargo: '',
    cidade: '',
    estado: '',
    produtosInteresse: [],
    origem: isInternal ? 'time_interno' : 'site',
    origemDetalhes: '',
    observacoes: '',
    status: 'novo',
    responsavel: '',
    dataContato: '',
    proximaAcao: '',
    dataProximaAcao: '',
    dataCriacao: new Date().toISOString(),
    criadoPor: isInternal ? 'Time Interno' : 'Lead Direto'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // Validação em tempo real
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'nome':
        if (!value || value.trim().length < 2) {
          return 'Nome completo é obrigatório (mínimo 2 caracteres)'
        }
        if (value.trim().split(' ').length < 2) {
          return 'Por favor, informe nome e sobrenome'
        }
        return ''
      
      case 'telefone':
        if (!value || value.trim().length === 0) {
          return 'Telefone é obrigatório'
        }
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
        if (!phoneRegex.test(value)) {
          return 'Formato inválido. Use: (11) 99999-9999'
        }
        return ''
      
      case 'email':
        if (value && value.trim().length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            return 'E-mail inválido'
          }
        }
        return ''
      
      case 'produtosInteresse':
        if (!value || value.length === 0) {
          return 'Selecione pelo menos um produto de interesse'
        }
        return ''
      
      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validação em tempo real
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  // Máscara para telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('telefone', formatted)
  }

  const handleProdutoToggle = (produtoId: string) => {
    const currentProducts = formData.produtosInteresse
    const newProducts = currentProducts.includes(produtoId)
      ? currentProducts.filter(id => id !== produtoId)
      : [...currentProducts, produtoId]
    
    handleInputChange('produtosInteresse', newProducts)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validar campos obrigatórios
    newErrors.nome = validateField('nome', formData.nome)
    newErrors.telefone = validateField('telefone', formData.telefone)
    newErrors.email = validateField('email', formData.email)
    newErrors.produtosInteresse = validateField('produtosInteresse', formData.produtosInteresse)

    setErrors(newErrors)
    
    // Retorna true se não há erros
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Adicionar timestamp de atualização
      const finalData: LeadFormType = {
        ...formData,
        dataUltimaAtualizacao: new Date().toISOString()
      }
      
      await onSubmit(finalData)
    } catch (error) {
      console.error('Erro ao salvar lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProdutoCard = (produto: ProdutoMedStaff) => {
    const IconComponent = iconMap[produto.icone] || Building2
    const isSelected = formData.produtosInteresse.includes(produto.id)
    
    return (
      <div
        key={produto.id}
        onClick={() => handleProdutoToggle(produto.id)}
        className={`
          relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
          ${isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-gray-300'
          }
        `}
      >
        <div className="flex items-start space-x-3">
          <div className={`
            p-2 rounded-lg flex-shrink-0
            ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
          `}>
            <IconComponent size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`
              font-medium text-sm leading-tight
              ${isSelected ? 'text-blue-900' : 'text-gray-900'}
            `}>
              {produto.nome}
            </h4>
            <p className={`
              text-xs mt-1 leading-tight
              ${isSelected ? 'text-blue-700' : 'text-gray-600'}
            `}>
              {produto.descricao}
            </p>
          </div>
          {isSelected && (
            <CheckCircle size={20} className="text-blue-600 flex-shrink-0" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus size={24} />
              <div>
                <h2 className="text-xl font-bold">
                  {isInternal ? 'Cadastrar Novo Lead' : 'Solicitar Contato'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isInternal 
                    ? 'Preencha os dados do lead para iniciar o acompanhamento'
                    : 'Preencha seus dados e entraremos em contato'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Dados Básicos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User size={20} className="mr-2 text-blue-600" />
                Dados Básicos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.nome ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="Digite seu nome completo"
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.telefone ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.telefone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.telefone}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.email ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu cargo atual"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sua cidade"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione o estado</option>
                    {ESTADOS_BRASIL.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Produtos de Interesse */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building size={20} className="mr-2 text-blue-600" />
                Produtos de Interesse <span className="text-red-500">*</span>
              </h3>
              
              {errors.produtosInteresse && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {errors.produtosInteresse}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRODUTOS_MEDSTAFF.filter(produto => produto.ativo).map(renderProdutoCard)}
              </div>

              {formData.produtosInteresse.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium">
                    {formData.produtosInteresse.length} produto(s) selecionado(s)
                  </p>
                </div>
              )}
            </div>

            {/* Campos adicionais para time interno */}
            {isInternal && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building size={20} className="mr-2 text-blue-600" />
                  Informações Adicionais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origem do Lead
                    </label>
                    <select
                      value={formData.origem}
                      onChange={(e) => handleInputChange('origem', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="site">Site</option>
                      <option value="indicacao">Indicação</option>
                      <option value="evento">Evento</option>
                      <option value="redes_sociais">Redes Sociais</option>
                      <option value="google">Google</option>
                      <option value="time_interno">Time Interno</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  {/* Detalhes da Origem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detalhes da Origem
                    </label>
                    <input
                      type="text"
                      value={formData.origemDetalhes}
                      onChange={(e) => handleInputChange('origemDetalhes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Evento XYZ, Indicação de João, etc."
                    />
                  </div>

                  {/* Responsável */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange('responsavel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="novo">Novo</option>
                      <option value="contatado">Contatado</option>
                      <option value="qualificado">Qualificado</option>
                      <option value="proposta">Proposta</option>
                      <option value="negociacao">Negociação</option>
                      <option value="ganho">Ganho</option>
                      <option value="perdido">Perdido</option>
                    </select>
                  </div>
                </div>

                {/* Observações */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações adicionais sobre o lead..."
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isInternal ? 'Cadastrar Lead' : 'Enviar Solicitação'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeadForm