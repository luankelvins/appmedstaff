import React, { useState, useEffect } from 'react'
import { 
  User, 
  Briefcase, 
  Heart, 
  Users, 
  DollarSign, 
  FileText, 
  Phone, 
  Settings,
  ChevronLeft, 
  ChevronRight, 
  Save, 
  X,
  MapPin,
  Calendar,
  Mail,
  Building,
  CreditCard,
  UserCheck
} from 'lucide-react'
import { ClientePFForm as ClientePFFormType, Document } from '../../types/crm'

interface ClientePFFormProps {
  initialData?: Partial<ClientePFFormType>
  onSubmit: (data: ClientePFFormType) => void
  onCancel: () => void
  isEditing?: boolean
}

const estadosCivis = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' }
]

const situacoesTrabalhistas = [
  { value: 'clt', label: 'CLT' },
  { value: 'autonomo', label: 'Autônomo' },
  { value: 'empresario', label: 'Empresário' },
  { value: 'aposentado', label: 'Aposentado' },
  { value: 'estudante', label: 'Estudante' },
  { value: 'desempregado', label: 'Desempregado' }
]

const grausParentesco = [
  'Filho(a)', 'Cônjuge', 'Pai/Mãe', 'Irmão/Irmã', 'Avô/Avó', 'Neto(a)', 'Outro'
]

const tiposContato = [
  { value: 'telefone', label: 'Telefone' },
  { value: 'email', label: 'E-mail' },
  { value: 'whatsapp', label: 'WhatsApp' }
]

export default function ClientePFForm({ initialData, onSubmit, onCancel, isEditing = false }: ClientePFFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ClientePFFormType>({
    dadosPessoais: {
      nome: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      estadoCivil: 'solteiro',
      profissao: '',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      },
      telefone: '',
      email: '',
      contatoEmergencia: {
        nome: '',
        telefone: '',
        parentesco: '',
        email: ''
      }
    },
    dadosProfissionais: {
      profissao: '',
      empresa: '',
      cargo: '',
      rendaMensal: 0,
      situacaoTrabalhista: 'clt',
      tempoEmpresa: '',
      registroConselho: ''
    },
    conjuge: {
      nome: '',
      cpf: '',
      dataNascimento: '',
      profissao: '',
      rendaMensal: 0
    },
    dependentes: [],
    dadosFinanceiros: {
      rendaFamiliar: 0,
      patrimonioTotal: 0,
      dadosBancarios: {
        banco: '',
        agencia: '',
        conta: '',
        tipoConta: 'corrente',
        pix: ''
      },
      outrasContas: []
    },
    servicosContratados: [],
    documentos: [],
    atendimentos: [],
    preferenciasContato: {
      melhorHorario: '',
      meioPreferido: 'telefone',
      observacoes: ''
    },
    status: 'ativo',
    responsavelComercial: '',
    responsavelOperacional: '',
    dataCadastro: new Date().toISOString().split('T')[0],
    dataUltimaAtualizacao: '',
    observacoes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
    }
  }, [initialData])

  const steps = [
    {
      title: 'Dados Pessoais',
      icon: User,
      description: 'Informações básicas do cliente'
    },
    {
      title: 'Dados Profissionais',
      icon: Briefcase,
      description: 'Informações profissionais e de renda'
    },
    {
      title: 'Cônjuge',
      icon: Heart,
      description: 'Dados do cônjuge (se aplicável)'
    },
    {
      title: 'Dependentes',
      icon: Users,
      description: 'Informações dos dependentes'
    },
    {
      title: 'Dados Financeiros',
      icon: DollarSign,
      description: 'Informações bancárias e financeiras'
    },
    {
      title: 'Serviços',
      icon: Settings,
      description: 'Serviços contratados'
    },
    {
      title: 'Documentos',
      icon: FileText,
      description: 'Documentos e anexos'
    },
    {
      title: 'Preferências',
      icon: Phone,
      description: 'Preferências de contato'
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (section: string, field: string, value: any, index?: number) => {
    setFormData(prev => {
      const newData = { ...prev }
      
      if (index !== undefined) {
        // Para arrays
        if (!newData[section as keyof ClientePFFormType]) {
          (newData as any)[section] = []
        }
        const array = (newData as any)[section] as any[]
        if (!array[index]) {
          array[index] = {}
        }
        array[index][field] = value
      } else if (section.includes('.')) {
        // Para objetos aninhados
        const [mainSection, subSection] = section.split('.')
        if (!newData[mainSection as keyof ClientePFFormType]) {
          (newData as any)[mainSection] = {}
        }
        if (subSection && !(newData as any)[mainSection][subSection]) {
          (newData as any)[mainSection][subSection] = {}
        }
        if (subSection) {
          (newData as any)[mainSection][subSection][field] = value
        } else {
          (newData as any)[mainSection][field] = value
        }
      } else {
        // Para campos simples
        if (!newData[section as keyof ClientePFFormType]) {
          (newData as any)[section] = {}
        }
        (newData as any)[section][field] = value
      }
      
      return newData
    })
  }

  const addDependente = () => {
    setFormData(prev => ({
      ...prev,
      dependentes: [
        ...prev.dependentes,
        {
          nome: '',
          cpf: '',
          dataNascimento: '',
          grauParentesco: '',
          estudante: false,
          rendimentos: 0
        }
      ]
    }))
  }

  const removeDependente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependentes: prev.dependentes.filter((_, i) => i !== index)
    }))
  }

  const addServico = () => {
    setFormData(prev => ({
      ...prev,
      servicosContratados: [
        ...prev.servicosContratados,
        {
          id: Date.now().toString(),
          servico: '',
          descricao: '',
          valor: 0,
          periodicidade: 'mensal',
          dataInicio: '',
          dataVencimento: '',
          status: 'ativo'
        }
      ]
    }))
  }

  const removeServico = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicosContratados: prev.servicosContratados.filter((_, i) => i !== index)
    }))
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  const buscarCEP = async (cep: string) => {
    if (cep.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          handleInputChange('dadosPessoais.endereco', 'logradouro', data.logradouro)
          handleInputChange('dadosPessoais.endereco', 'bairro', data.bairro)
          handleInputChange('dadosPessoais.endereco', 'cidade', data.localidade)
          handleInputChange('dadosPessoais.endereco', 'estado', data.uf)
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Dados Pessoais
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.dadosPessoais.nome}
                  onChange={(e) => handleInputChange('dadosPessoais', 'nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  value={formData.dadosPessoais.cpf}
                  onChange={(e) => handleInputChange('dadosPessoais', 'cpf', formatCPF(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG
                </label>
                <input
                  type="text"
                  value={formData.dadosPessoais.rg || ''}
                  onChange={(e) => handleInputChange('dadosPessoais', 'rg', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={formData.dadosPessoais.dataNascimento}
                  onChange={(e) => handleInputChange('dadosPessoais', 'dataNascimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Civil *
                </label>
                <select
                  value={formData.dadosPessoais.estadoCivil}
                  onChange={(e) => handleInputChange('dadosPessoais', 'estadoCivil', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {estadosCivis.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissão *
                </label>
                <input
                  type="text"
                  value={formData.dadosPessoais.profissao}
                  onChange={(e) => handleInputChange('dadosPessoais', 'profissao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="text"
                  value={formData.dadosPessoais.telefone}
                  onChange={(e) => handleInputChange('dadosPessoais', 'telefone', formatPhone(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.dadosPessoais.email}
                  onChange={(e) => handleInputChange('dadosPessoais', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.cep}
                    onChange={(e) => {
                      const cep = formatCEP(e.target.value)
                      handleInputChange('dadosPessoais.endereco', 'cep', cep)
                      buscarCEP(cep)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                    maxLength={9}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logradouro *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.logradouro}
                    onChange={(e) => handleInputChange('dadosPessoais.endereco', 'logradouro', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.numero}
                    onChange={(e) => handleInputChange('dadosPessoais.endereco', 'numero', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.complemento || ''}
                    onChange={(e) => handleInputChange('dadosPessoais.endereco', 'complemento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.bairro}
                    onChange={(e) => handleInputChange('dadosPessoais.endereco', 'bairro', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.cidade}
                    onChange={(e) => handleInputChange('dadosPessoais.endereco', 'cidade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.endereco.estado}
                    onChange={(e) => handleInputChange('dadosPessoais.endereco', 'estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contato de Emergência
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.contatoEmergencia?.nome || ''}
                    onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia', 'nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.contatoEmergencia?.telefone || ''}
                    onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia', 'telefone', formatPhone(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parentesco
                  </label>
                  <input
                    type="text"
                    value={formData.dadosPessoais.contatoEmergencia?.parentesco || ''}
                    onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia', 'parentesco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.dadosPessoais.contatoEmergencia?.email || ''}
                    onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 1: // Dados Profissionais
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissão *
                </label>
                <input
                  type="text"
                  value={formData.dadosProfissionais.profissao}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'profissao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situação Trabalhista *
                </label>
                <select
                  value={formData.dadosProfissionais.situacaoTrabalhista}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'situacaoTrabalhista', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {situacoesTrabalhistas.map(situacao => (
                    <option key={situacao.value} value={situacao.value}>
                      {situacao.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.dadosProfissionais.empresa || ''}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'empresa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.dadosProfissionais.cargo || ''}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'cargo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renda Mensal
                </label>
                <input
                  type="number"
                  value={formData.dadosProfissionais.rendaMensal || ''}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'rendaMensal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo na Empresa
                </label>
                <input
                  type="text"
                  value={formData.dadosProfissionais.tempoEmpresa || ''}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'tempoEmpresa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2 anos e 6 meses"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registro no Conselho
                </label>
                <input
                  type="text"
                  value={formData.dadosProfissionais.registroConselho || ''}
                  onChange={(e) => handleInputChange('dadosProfissionais', 'registroConselho', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: CRM 12345/SP"
                />
              </div>
            </div>
          </div>
        )

      case 2: // Cônjuge
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Preencha apenas se o estado civil for "Casado(a)" ou "União Estável"
              </p>
            </div>

            {(formData.dadosPessoais.estadoCivil === 'casado' || formData.dadosPessoais.estadoCivil === 'uniao_estavel') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cônjuge
                  </label>
                  <input
                    type="text"
                    value={formData.conjuge?.nome || ''}
                    onChange={(e) => handleInputChange('conjuge', 'nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF do Cônjuge
                  </label>
                  <input
                    type="text"
                    value={formData.conjuge?.cpf || ''}
                    onChange={(e) => handleInputChange('conjuge', 'cpf', formatCPF(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.conjuge?.dataNascimento || ''}
                    onChange={(e) => handleInputChange('conjuge', 'dataNascimento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profissão
                  </label>
                  <input
                    type="text"
                    value={formData.conjuge?.profissao || ''}
                    onChange={(e) => handleInputChange('conjuge', 'profissao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renda Mensal
                  </label>
                  <input
                    type="number"
                    value={formData.conjuge?.rendaMensal || ''}
                    onChange={(e) => handleInputChange('conjuge', 'rendaMensal', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Dependentes
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Dependentes</h3>
              <button
                type="button"
                onClick={addDependente}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Adicionar Dependente
              </button>
            </div>

            {formData.dependentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum dependente cadastrado
              </div>
            ) : (
              <div className="space-y-4">
                {formData.dependentes.map((dependente, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Dependente {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeDependente(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={dependente.nome}
                          onChange={(e) => handleInputChange('dependentes', 'nome', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CPF
                        </label>
                        <input
                          type="text"
                          value={dependente.cpf || ''}
                          onChange={(e) => handleInputChange('dependentes', 'cpf', formatCPF(e.target.value), index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          value={dependente.dataNascimento}
                          onChange={(e) => handleInputChange('dependentes', 'dataNascimento', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grau de Parentesco
                        </label>
                        <select
                          value={dependente.grauParentesco}
                          onChange={(e) => handleInputChange('dependentes', 'grauParentesco', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione...</option>
                          {grausParentesco.map(grau => (
                            <option key={grau} value={grau}>
                              {grau}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dependente.estudante || false}
                            onChange={(e) => handleInputChange('dependentes', 'estudante', e.target.checked, index)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Estudante</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rendimentos
                        </label>
                        <input
                          type="number"
                          value={dependente.rendimentos || ''}
                          onChange={(e) => handleInputChange('dependentes', 'rendimentos', parseFloat(e.target.value) || 0, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 4: // Dados Financeiros
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renda Familiar *
                </label>
                <input
                  type="number"
                  value={formData.dadosFinanceiros.rendaFamiliar}
                  onChange={(e) => handleInputChange('dadosFinanceiros', 'rendaFamiliar', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrimônio Total
                </label>
                <input
                  type="number"
                  value={formData.dadosFinanceiros.patrimonioTotal || ''}
                  onChange={(e) => handleInputChange('dadosFinanceiros', 'patrimonioTotal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Dados Bancários Principais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosFinanceiros.dadosBancarios.banco}
                    onChange={(e) => handleInputChange('dadosFinanceiros.dadosBancarios', 'banco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosFinanceiros.dadosBancarios.agencia}
                    onChange={(e) => handleInputChange('dadosFinanceiros.dadosBancarios', 'agencia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conta *
                  </label>
                  <input
                    type="text"
                    value={formData.dadosFinanceiros.dadosBancarios.conta}
                    onChange={(e) => handleInputChange('dadosFinanceiros.dadosBancarios', 'conta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta *
                  </label>
                  <select
                    value={formData.dadosFinanceiros.dadosBancarios.tipoConta}
                    onChange={(e) => handleInputChange('dadosFinanceiros.dadosBancarios', 'tipoConta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIX
                  </label>
                  <input
                    type="text"
                    value={formData.dadosFinanceiros.dadosBancarios.pix || ''}
                    onChange={(e) => handleInputChange('dadosFinanceiros.dadosBancarios', 'pix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5: // Serviços
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Serviços Contratados</h3>
              <button
                type="button"
                onClick={addServico}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Adicionar Serviço
              </button>
            </div>

            {formData.servicosContratados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum serviço contratado
              </div>
            ) : (
              <div className="space-y-4">
                {formData.servicosContratados.map((servico, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Serviço {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeServico(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Serviço
                        </label>
                        <input
                          type="text"
                          value={servico.servico}
                          onChange={(e) => handleInputChange('servicosContratados', 'servico', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valor
                        </label>
                        <input
                          type="number"
                          value={servico.valor}
                          onChange={(e) => handleInputChange('servicosContratados', 'valor', parseFloat(e.target.value) || 0, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Periodicidade
                        </label>
                        <select
                          value={servico.periodicidade}
                          onChange={(e) => handleInputChange('servicosContratados', 'periodicidade', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="mensal">Mensal</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="semestral">Semestral</option>
                          <option value="anual">Anual</option>
                          <option value="unico">Único</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={servico.status}
                          onChange={(e) => handleInputChange('servicosContratados', 'status', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ativo">Ativo</option>
                          <option value="suspenso">Suspenso</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Início
                        </label>
                        <input
                          type="date"
                          value={servico.dataInicio}
                          onChange={(e) => handleInputChange('servicosContratados', 'dataInicio', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Vencimento
                        </label>
                        <input
                          type="date"
                          value={servico.dataVencimento || ''}
                          onChange={(e) => handleInputChange('servicosContratados', 'dataVencimento', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={servico.descricao}
                          onChange={(e) => handleInputChange('servicosContratados', 'descricao', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 6: // Documentos
        return (
          <div className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Funcionalidade de upload de documentos será implementada</p>
            </div>
          </div>
        )

      case 7: // Preferências
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Melhor Horário para Contato
                </label>
                <input
                  type="text"
                  value={formData.preferenciasContato.melhorHorario}
                  onChange={(e) => handleInputChange('preferenciasContato', 'melhorHorario', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 9h às 18h"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meio de Contato Preferido
                </label>
                <select
                  value={formData.preferenciasContato.meioPreferido}
                  onChange={(e) => handleInputChange('preferenciasContato', 'meioPreferido', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposContato.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações sobre Contato
                </label>
                <textarea
                  value={formData.preferenciasContato.observacoes || ''}
                  onChange={(e) => handleInputChange('preferenciasContato', 'observacoes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Informações adicionais sobre preferências de contato..."
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações de Controle</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável Comercial *
                  </label>
                  <input
                    type="text"
                    value={formData.responsavelComercial}
                    onChange={(e) => handleInputChange('', 'responsavelComercial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável Operacional
                  </label>
                  <input
                    type="text"
                    value={formData.responsavelOperacional || ''}
                    onChange={(e) => handleInputChange('', 'responsavelOperacional', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('', 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações Gerais
                  </label>
                  <textarea
                    value={formData.observacoes || ''}
                    onChange={(e) => handleInputChange('', 'observacoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Observações gerais sobre o cliente..."
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Editar Cliente Pessoa Física' : 'Novo Cliente Pessoa Física'}
        </h1>
        <p className="text-gray-600">
          Preencha as informações do cliente pessoa física
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    hidden md:block absolute top-5 w-full h-0.5 -z-10
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `} style={{ left: '50%', width: 'calc(100% - 2.5rem)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </button>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}