import React, { useState, useEffect } from 'react'
import { 
  User, 
  MapPin, 
  Briefcase, 
  Heart, 
  Shield, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  DollarSign,
  Users,
  Clock,
  Phone,
  Mail,
  Building,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react'
import { TimeInternoForm as TimeInternoFormType, MandatoryDocument } from '../../types/crm'

// Estrutura hierárquica organizacional
const organizationalHierarchy = {
  'Diretoria Executiva': {
    'Sênior': ['Diretor Executivo', 'Gerente de Estratégia e Planejamento'],
    'Pleno': ['Assistente Executivo']
  },
  'Diretoria de Tecnologia, Inovação e Produtos': {
    'Tecnologia': {
      'Sênior': ['Diretor de TI e de Infraestrutura','Gerente de TI e de Infraestrutura'],
      'Pleno': ['Analistas de Suporte / Redes'],
      'Júnior': ['Estagiários (TI)']
    },
    'Produtos': {
      'Sênior': ['Gerente de Produtos'],
      'Pleno': ['Product Owner', 'Desenvolvedor']
    },
    'Inovação': {
      'Sênior': ['Gerente de Inovação e de Projetos Digitais']
    }
  },
  'Diretoria Comercial e Marketing': {
    'Comercial': {
      'Sênior': ['Diretor Comercial e de Marketing', 'Gerente Comercial'],
      'Pleno': ['Analista Comercial']
    },
    'Marketing': {
      'Sênior': ['Gerente de Marketing'],
      'Pleno': ['Analista de Marketing']
    }
  },
  'Diretoria Administrativa e Financeira': {
    'Financeira': {
      'Sênior': ['Diretor Administrivo e Financeiro', 'Gerente Financeiro'],
      'Pleno': ['Analista de Controladoria e Tesouraria']
    },
    'Administrativa': {
      'Sênior': ['Gerente Administrativo'],
      'Pleno': ['Analista Administrativo']
    },
    'Contábil/Fiscal': {
      'Sênior': ['Gerente Contábil/Fiscal'],
      'Pleno': ['Analista Contábil']
    },
    'RH / DP': {
      'Sênior': ['Coordenador de RH / DP'],
      'Pleno': ['Analista de RH'],
      'Júnior': ['Assistente Administrativo']
    },
    'Jurídico': {
      'Sênior': ['Coordenador Jurídico'],
      'Pleno': ['Advogado'],
      'Júnior': ['Assistente Jurídico']
    }
  },
  'Diretoria Operacional': {
    'Operações': {
      'Sênior': ['Diretor operacional', 'Gerente de Operações'],
      'Pleno': ['Coordenador Operacional', 'Analista de Processos Operacionais'],
      'Júnior': ['Estagiários (multiárea)']
    }
  },
  'Diretoria de CS e Processos': {
    'Customer Success': {
      'Sênior': ['Diretor de CS', 'Gerente de CS'],
      'Pleno': ['Analista de CS e Suporte (SAC)']
    },
    'Processos / Qualidade': {
      'Sênior': ['Gerente de Processos'],
      'Pleno': ['Analista de Processos e Melhoria Contínua']
    }
  }
}

// Função para criar mapeamento cargo -> departamento
const createCargoToDepartmentMap = () => {
  const cargoToDepartment: { [key: string]: string } = {}
  
  Object.entries(organizationalHierarchy).forEach(([diretoria, departments]) => {
    Object.entries(departments).forEach(([department, levels]) => {
      if (typeof levels === 'object' && !Array.isArray(levels)) {
        // Departamento com níveis hierárquicos
        Object.entries(levels).forEach(([level, cargos]) => {
          if (Array.isArray(cargos)) {
            cargos.forEach(cargo => {
              cargoToDepartment[cargo] = department
            })
          }
        })
      } else if (Array.isArray(levels)) {
        // Departamento direto (como Diretoria Executiva)
        levels.forEach(cargo => {
          cargoToDepartment[cargo] = diretoria
        })
      }
    })
  })
  
  return cargoToDepartment
}

// Estrutura de dados de colaboradores por departamento (simulando dados do sistema)
const employeesByDepartment = {
  'Diretoria Executiva': [
    { id: '1', nome: 'Carlos Silva', cargo: 'Diretor Executivo' },
    { id: '2', nome: 'Ana Costa', cargo: 'Gerente de Estratégia e Planejamento' },
    { id: '3', nome: 'Maria Santos', cargo: 'Assistente Executivo' }
  ],
  'Diretoria de Tecnologia, Inovação e Produtos': [
    { id: '35', nome: 'Ricardo Almeida', cargo: 'Diretor de Tecnologia' },
    { id: '36', nome: 'Luciana Ferreira', cargo: 'Diretora de Inovação' }
  ],
  'Diretoria Comercial e Marketing': [
    { id: '37', nome: 'Fernando Santos', cargo: 'Diretor Comercial' },
    { id: '38', nome: 'Carla Oliveira', cargo: 'Diretora de Marketing' }
  ],
  'Diretoria Administrativa e Financeira': [
    { id: '39', nome: 'Roberto Lima', cargo: 'Diretor Administrativo' },
    { id: '40', nome: 'Sandra Costa', cargo: 'Diretora Financeira' }
  ],
  'Diretoria Operacional': [
    { id: '41', nome: 'Paulo Mendes', cargo: 'Diretor Operacional' }
  ],
  'Diretoria de CS e Processos': [
    { id: '42', nome: 'Juliana Rocha', cargo: 'Diretora de CS' },
    { id: '43', nome: 'Marcos Silva', cargo: 'Diretor de Processos' }
  ],
  'Tecnologia': [
    { id: '4', nome: 'João Oliveira', cargo: 'Gerente de TI e de Infraestrutura' },
    { id: '5', nome: 'Pedro Lima', cargo: 'Analistas de Suporte / Redes' },
    { id: '6', nome: 'Lucas Ferreira', cargo: 'Estagiários (TI)' }
  ],
  'Produtos': [
    { id: '7', nome: 'Fernanda Rocha', cargo: 'Gerente de Produtos' },
    { id: '8', nome: 'Rafael Mendes', cargo: 'Product Owner' },
    { id: '9', nome: 'Juliana Alves', cargo: 'Desenvolvedor' }
  ],
  'Inovação': [
    { id: '10', nome: 'Roberto Cardoso', cargo: 'Gerente de Inovação e de Projetos Digitais' }
  ],
  'Comercial': [
    { id: '11', nome: 'Mariana Souza', cargo: 'Gerente Comercial' },
    { id: '12', nome: 'Diego Martins', cargo: 'Analista Comercial' }
  ],
  'Marketing': [
    { id: '13', nome: 'Camila Ribeiro', cargo: 'Gerente de Marketing' },
    { id: '14', nome: 'Bruno Nascimento', cargo: 'Analista de Marketing' }
  ],
  'Financeira': [
    { id: '15', nome: 'Patricia Gomes', cargo: 'Gerente Financeiro' },
    { id: '16', nome: 'André Barbosa', cargo: 'Analista de Controladoria e Tesouraria' }
  ],
  'Administrativa': [
    { id: '17', nome: 'Renata Pereira', cargo: 'Gerente Administrativo' },
    { id: '18', nome: 'Thiago Moreira', cargo: 'Analista Administrativo' }
  ],
  'Contábil/Fiscal': [
    { id: '19', nome: 'Claudia Dias', cargo: 'Gerente Contábil/Fiscal' },
    { id: '20', nome: 'Marcos Teixeira', cargo: 'Analista Contábil' }
  ],
  'RH / DP': [
    { id: '21', nome: 'Vanessa Castro', cargo: 'Coordenador de RH / DP' },
    { id: '22', nome: 'Gabriel Araújo', cargo: 'Analista de RH' },
    { id: '23', nome: 'Isabela Correia', cargo: 'Assistente Administrativo' }
  ],
  'Jurídico': [
    { id: '24', nome: 'Eduardo Ramos', cargo: 'Coordenador Jurídico' },
    { id: '25', nome: 'Larissa Freitas', cargo: 'Advogado' },
    { id: '26', nome: 'Felipe Monteiro', cargo: 'Assistente Jurídico' }
  ],
  'Operações': [
    { id: '27', nome: 'Cristiane Lopes', cargo: 'Gerente de Operações' },
    { id: '28', nome: 'Rodrigo Cunha', cargo: 'Coordenador Operacional' },
    { id: '29', nome: 'Aline Vieira', cargo: 'Analista de Processos Operacionais' },
    { id: '30', nome: 'Gustavo Pinto', cargo: 'Estagiários (multiárea)' }
  ],
  'Customer Success': [
    { id: '31', nome: 'Tatiana Campos', cargo: 'Gerente de CS' },
    { id: '32', nome: 'Leonardo Silva', cargo: 'Analista de CS e Suporte (SAC)' }
  ],
  'Processos / Qualidade': [
    { id: '33', nome: 'Priscila Nunes', cargo: 'Gerente de Processos' },
    { id: '34', nome: 'Henrique Batista', cargo: 'Analista de Processos e Melhoria Contínua' }
  ]
}

// Função para definir hierarquia organizacional (departamentos superiores)
const getDepartmentHierarchy = () => {
  return {
    'Diretoria Executiva': [], // Topo da hierarquia
    'Tecnologia': ['Diretoria Executiva'],
    'Produtos': ['Diretoria Executiva'],
    'Inovação': ['Diretoria Executiva'],
    'Comercial': ['Diretoria Executiva'],
    'Marketing': ['Diretoria Executiva'],
    'Financeira': ['Diretoria Executiva'],
    'Administrativa': ['Diretoria Executiva'],
    'Contábil/Fiscal': ['Diretoria Executiva'],
    'RH / DP': ['Diretoria Executiva'],
    'Jurídico': ['Diretoria Executiva'],
    'Operações': ['Diretoria Executiva'],
    'Customer Success': ['Diretoria Executiva'],
    'Processos / Qualidade': ['Diretoria Executiva']
  }
}

// Função para obter gestores disponíveis baseado no departamento selecionado
const getAvailableManagers = (selectedDepartment: string) => {
  if (!selectedDepartment) return []
  
  const hierarchy = getDepartmentHierarchy()
  const availableManagers: Array<{ id: string; nome: string; cargo: string; departamento: string }> = []
  
  // Adicionar colaboradores do próprio departamento
  if (employeesByDepartment[selectedDepartment as keyof typeof employeesByDepartment]) {
    employeesByDepartment[selectedDepartment as keyof typeof employeesByDepartment].forEach(employee => {
      availableManagers.push({
        ...employee,
        departamento: selectedDepartment
      })
    })
  }
  
  // Adicionar colaboradores de departamentos superiores na hierarquia
  const superiorDepartments = hierarchy[selectedDepartment as keyof typeof hierarchy] || []
  superiorDepartments.forEach(superiorDept => {
    if (employeesByDepartment[superiorDept as keyof typeof employeesByDepartment]) {
      employeesByDepartment[superiorDept as keyof typeof employeesByDepartment].forEach(employee => {
        availableManagers.push({
          ...employee,
          departamento: superiorDept
        })
      })
    }
  })
  
  // Ordenar por departamento (superiores primeiro) e depois por cargo (seniores primeiro)
  return availableManagers.sort((a, b) => {
    // Priorizar departamentos superiores
    if (a.departamento !== b.departamento) {
      if (a.departamento === 'Diretoria Executiva') return -1
      if (b.departamento === 'Diretoria Executiva') return 1
      return a.departamento.localeCompare(b.departamento)
    }
    // Dentro do mesmo departamento, priorizar cargos seniores
    const seniorityOrder = ['Diretor', 'Gerente', 'Coordenador', 'Analista', 'Assistente', 'Estagiário']
    const aSeniority = seniorityOrder.findIndex(level => a.cargo.includes(level))
    const bSeniority = seniorityOrder.findIndex(level => b.cargo.includes(level))
    return aSeniority - bSeniority
  })
}

interface TimeInternoFormProps {
  initialData?: Partial<TimeInternoFormType>
  onSubmit: (data: TimeInternoFormType) => void
  onCancel: () => void
}

const TimeInternoForm: React.FC<TimeInternoFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  // Criar mapeamento cargo -> departamento
  const cargoToDepartmentMap = createCargoToDepartmentMap()

  const [formData, setFormData] = useState<TimeInternoFormType>({
    numeroRegistro: '',
    dadosPessoais: {
      nome: '',
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
      },
      telefone: '',
      emailPessoal: '',
      alergias: '',
      contatoEmergencia: {
        nome: '',
        telefone: '',
        parentesco: '',
        email: ''
      }
    },
    dadosProfissionais: {
      cargo: '',
      departamento: '',
      gestorResponsavel: '',
      dataAdmissao: '',
      salario: 0,
      regime: 'clt'
    },
    jornadaTrabalho: {
      escala: '',
      cargaHoraria: 0,
      horarioEntrada: '',
      horarioSaida: '',
      intervalos: ''
    },
    aso: {
      admissional: {
        data: '',
        medico: '',
        arquivo: undefined
      }
    },
    dependentes: [],
    dadosFinanceiros: {
      salarioBase: 0,
      beneficios: [],
      dadosBancarios: {
        banco: '',
        agencia: '',
        conta: '',
        tipoConta: 'corrente',
        pix: ''
      }
    },
    documentos: [],
    documentosObrigatorios: [],
    anexosNotificacoes: [],
    anexos: [],
    observacoesAnexos: '',
    status: 'ativo',
    responsavelRH: '',
    comments: []
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const steps = [
    { id: 1, title: 'Dados Pessoais', icon: User, description: 'Informações básicas do colaborador' },
    { id: 2, title: 'Dados Profissionais', icon: Briefcase, description: 'Cargo, departamento e admissão' },
    { id: 3, title: 'Jornada de Trabalho', icon: Clock, description: 'Horários e escala de trabalho' },
    { id: 4, title: 'Saúde e ASO', icon: Shield, description: 'Exames e informações de saúde' },
    { id: 5, title: 'Dados Financeiros', icon: DollarSign, description: 'Salário e benefícios' },
    { id: 6, title: 'Documentos', icon: FileText, description: 'Documentação obrigatória' },
    { id: 7, title: 'Anexos', icon: FileText, description: 'Arquivos adicionais e complementares' }
  ]

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof TimeInternoFormType] as any),
        [field]: value
      }
    }))
  }

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof TimeInternoFormType] as any),
        [subsection]: {
          ...((prev[section as keyof TimeInternoFormType] as any)?.[subsection] || {}),
          [field]: value
        }
      }
    }))
  }

  // Função específica para lidar com mudança de cargo
  const handleCargoChange = (cargo: string) => {
    const departamento = cargoToDepartmentMap[cargo] || ''
    
    setFormData(prev => ({
      ...prev,
      dadosProfissionais: {
        ...prev.dadosProfissionais,
        cargo: cargo,
        departamento: departamento,
        gestorResponsavel: '' // Limpar gestor quando cargo mudar
      }
    }))
  }

  // Função para renderizar opções de cargo agrupadas
  const renderCargoOptions = () => {
    const options: JSX.Element[] = []
    
    Object.entries(organizationalHierarchy).forEach(([diretoria, departments]) => {
      // Adicionar grupo da diretoria
      options.push(
        <optgroup key={diretoria} label={diretoria}>
          {Object.entries(departments).map(([department, levels]) => {
            if (typeof levels === 'object' && !Array.isArray(levels)) {
              // Departamento com níveis hierárquicos
              return Object.entries(levels).map(([level, cargos]) => {
                if (Array.isArray(cargos)) {
                  return cargos.map(cargo => (
                    <option key={cargo} value={cargo}>
                      {`${department} - ${level}: ${cargo}`}
                    </option>
                  ))
                }
                return null
              }).flat()
            } else if (Array.isArray(levels)) {
              // Departamento direto (como Diretoria Executiva)
              return levels.map(cargo => (
                <option key={cargo} value={cargo}>
                  {`${department}: ${cargo}`}
                </option>
              ))
            }
            return null
          }).flat()}
        </optgroup>
      )
    })
    
    return options
  }

  const addDependent = () => {
    setFormData(prev => ({
      ...prev,
      dependentes: [
        ...prev.dependentes,
        {
          nome: '',
          dataNascimento: '',
          grauParentesco: '',
          cpf: ''
        }
      ]
    }))
  }

  const removeDependent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependentes: prev.dependentes.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      dadosFinanceiros: {
        ...prev.dadosFinanceiros,
        beneficios: [
          ...prev.dadosFinanceiros.beneficios,
          {
            tipo: '',
            valor: 0
          }
        ]
      }
    }))
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dadosFinanceiros: {
        ...prev.dadosFinanceiros,
        beneficios: prev.dadosFinanceiros.beneficios.filter((_, i) => i !== index)
      }
    }))
  }

  const addDependente = () => {
    setFormData(prev => ({
      ...prev,
      dependentes: [
        ...prev.dependentes,
        {
          nome: '',
          dataNascimento: '',
          grauParentesco: '',
          cpf: ''
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

  const addDocumento = () => {
    setFormData(prev => ({
      ...prev,
      documentos: [
        ...prev.documentos,
        {
          id: Date.now().toString(),
          nome: '',
          tipo: '',
          arquivo: undefined,
          url: '',
          data: new Date().toISOString().split('T')[0],
          descricao: '',
          categoria: 'outros' as const
        }
      ]
    }))
  }

  const removeDocumento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index)
    }))
  }

  // Função para gerenciar documentos obrigatórios
  const handleMandatoryDocumentUpdate = (documents: MandatoryDocument[]) => {
    setFormData(prev => ({
      ...prev,
      documentosObrigatorios: documents
    }))
  }

  // Função para buscar CEP via ViaCEP
  const fetchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            dadosPessoais: {
              ...prev.dadosPessoais,
              endereco: {
                ...prev.dadosPessoais.endereco,
                cep: formatCEP(cleanCEP),
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || ''
              }
            }
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return formattedValue
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : 
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-24">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `} style={{ transform: 'translateX(50%)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderPersonalDataStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <User className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-800">Dados Pessoais</h3>
        </div>
        <p className="text-blue-600 text-sm mt-1">Preencha as informações básicas do colaborador</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.dadosPessoais.nome}
            onChange={(e) => handleInputChange('dadosPessoais', 'nome', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite o nome completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Registro *
          </label>
          <input
            type="text"
            value={formData.numeroRegistro || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, numeroRegistro: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: 001234"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite o RG"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Selecione</option>
            <option value="solteiro">Solteiro(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viuvo">Viúvo(a)</option>
            <option value="uniao_estavel">União Estável</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Telefone *
          </label>
          <input
            type="tel"
            value={formData.dadosPessoais.telefone}
            onChange={(e) => handleInputChange('dadosPessoais', 'telefone', formatPhone(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            E-mail Pessoal *
          </label>
          <input
            type="email"
            value={formData.dadosPessoais.emailPessoal}
            onChange={(e) => handleInputChange('dadosPessoais', 'emailPessoal', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="email@exemplo.com"
            required
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-gray-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-800">Endereço</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.cep}
              onChange={(e) => {
                const formattedCEP = formatCEP(e.target.value)
                handleNestedInputChange('dadosPessoais', 'endereco', 'cep', formattedCEP)
                // Buscar endereço automaticamente quando CEP estiver completo
                if (formattedCEP.replace(/\D/g, '').length === 8) {
                  fetchCEP(formattedCEP)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00000-000"
              maxLength={9}
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro *</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.logradouro}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'endereco', 'logradouro', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rua, Avenida, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.numero}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'endereco', 'numero', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.complemento || ''}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'endereco', 'complemento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apto, Sala, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.bairro}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'endereco', 'bairro', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome do bairro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.cidade}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'endereco', 'cidade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome da cidade"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
            <select
              value={formData.dadosPessoais.endereco.estado}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'endereco', 'estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contato de Emergência */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <h4 className="text-lg font-medium text-red-800">Contato de Emergência</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              value={formData.dadosPessoais.contatoEmergencia?.nome || ''}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'contatoEmergencia', 'nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome do contato"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
            <input
              type="tel"
              value={formData.dadosPessoais.contatoEmergencia?.telefone || ''}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'contatoEmergencia', 'telefone', formatPhone(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parentesco</label>
            <input
              type="text"
              value={formData.dadosPessoais.contatoEmergencia?.parentesco || ''}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'contatoEmergencia', 'parentesco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Mãe, Pai, Cônjuge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              value={formData.dadosPessoais.contatoEmergencia?.email || ''}
              onChange={(e) => handleNestedInputChange('dadosPessoais', 'contatoEmergencia', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
      </div>


    </div>
  )

  // Render Professional Data Step
  const renderProfessionalDataStep = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-3 rounded-lg mr-4">
          <Briefcase className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dados Profissionais</h2>
          <p className="text-gray-600">Informações sobre cargo e vínculo empregatício</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Cargo *
          </label>
          <select
            value={formData.dadosProfissionais.cargo}
            onChange={(e) => handleCargoChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione o cargo</option>
            {renderCargoOptions()}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            O departamento será preenchido automaticamente com base no cargo selecionado
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Departamento *
          </label>
          <input
            type="text"
            value={formData.dadosProfissionais.departamento}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            placeholder="Será preenchido automaticamente"
            readOnly
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Preenchido automaticamente baseado no cargo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Gestor Responsável
          </label>
          <select
            value={formData.dadosProfissionais.gestorResponsavel || ''}
            onChange={(e) => handleInputChange('dadosProfissionais', 'gestorResponsavel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!formData.dadosProfissionais.departamento}
          >
            <option value="">
              {formData.dadosProfissionais.departamento 
                ? 'Selecione o gestor responsável' 
                : 'Primeiro selecione um cargo para definir o departamento'}
            </option>
            {formData.dadosProfissionais.departamento && 
              getAvailableManagers(formData.dadosProfissionais.departamento).map((manager) => (
                <option key={manager.id} value={manager.nome}>
                  {manager.nome} - {manager.cargo}
                  {manager.departamento !== formData.dadosProfissionais.departamento && 
                    ` (${manager.departamento})`}
                </option>
              ))
            }
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.dadosProfissionais.departamento 
              ? `Gestores disponíveis do departamento ${formData.dadosProfissionais.departamento} e superiores na hierarquia`
              : 'Selecione um cargo primeiro para ver os gestores disponíveis'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Admissão *</label>
          <input
            type="date"
            value={formData.dadosProfissionais.dataAdmissao}
            onChange={(e) => handleNestedInputChange('dadosProfissionais', '', 'dataAdmissao', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Regime de Contratação *</label>
          <select
            value={formData.dadosProfissionais.regime}
            onChange={(e) => handleNestedInputChange('dadosProfissionais', '', 'regime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione o regime</option>
            <option value="clt">CLT</option>
            <option value="pj">Pessoa Jurídica</option>
            <option value="estagiario">Estagiário</option>
            <option value="terceirizado">Terceirizado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Salário Base *</label>
          <input
            type="text"
            value={formData.dadosProfissionais.salario}
            onChange={(e) => handleNestedInputChange('dadosProfissionais', '', 'salario', formatCurrency(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      {/* Benefícios */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Benefícios
        </h3>
        {formData.dadosFinanceiros.beneficios.map((beneficio, index) => (
          <div key={index} className="bg-white p-4 border border-gray-200 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Benefício {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeBenefit(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Benefício</label>
                <select
                  value={beneficio.tipo}
                  onChange={(e) => {
                    const newBeneficios = [...formData.dadosFinanceiros.beneficios]
                    newBeneficios[index] = { ...beneficio, tipo: e.target.value }
                    handleNestedInputChange('dadosFinanceiros', '', 'beneficios', newBeneficios)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o benefício</option>
                  <option value="Vale Alimentação">Vale Alimentação</option>
                  <option value="Vale Transporte">Vale Transporte</option>
                  <option value="Plano de Saúde">Plano de Saúde</option>
                  <option value="Plano Odontológico">Plano Odontológico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <input
                  type="text"
                  value={beneficio.valor}
                  onChange={(e) => {
                    const newBeneficios = [...formData.dadosFinanceiros.beneficios]
                    newBeneficios[index] = { ...beneficio, valor: parseFloat(e.target.value) || 0 }
                    handleNestedInputChange('dadosFinanceiros', '', 'beneficios', newBeneficios)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addBenefit}
          className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Benefício
        </button>
      </div>
    </div>
  )

  // Render Work Schedule Step
  const renderWorkScheduleStep = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
      <div className="flex items-center mb-6">
        <div className="bg-green-500 p-3 rounded-lg mr-4">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jornada de Trabalho</h2>
          <p className="text-gray-600">Horários e configurações de trabalho</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Entrada *</label>
          <input
            type="time"
            value={formData.jornadaTrabalho.horarioEntrada}
            onChange={(e) => handleNestedInputChange('jornadaTrabalho', '', 'horarioEntrada', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Saída *</label>
          <input
            type="time"
            value={formData.jornadaTrabalho.horarioSaida}
            onChange={(e) => handleNestedInputChange('jornadaTrabalho', '', 'horarioSaida', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Intervalos</label>
          <input
            type="text"
            value={formData.jornadaTrabalho.intervalos || ''}
            onChange={(e) => handleNestedInputChange('jornadaTrabalho', '', 'intervalos', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ex: 12:00 - 13:00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Escala de Trabalho</label>
          <select
            value={formData.jornadaTrabalho.escala || ''}
            onChange={(e) => handleNestedInputChange('jornadaTrabalho', '', 'escala', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecione a escala</option>
            <option value="segunda-sexta">Segunda a Sexta</option>
            <option value="segunda-sabado">Segunda a Sábado</option>
            <option value="plantao">Plantão</option>
            <option value="escala-12x36">Escala 12x36</option>
            <option value="escala-24x48">Escala 24x48</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Carga Horária (horas/semana)</label>
          <input
            type="number"
            value={formData.jornadaTrabalho.cargaHoraria || ''}
            onChange={(e) => handleNestedInputChange('jornadaTrabalho', '', 'cargaHoraria', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="40"
            min="0"
            max="60"
          />
        </div>
      </div>
    </div>
  )

  // Render Health and ASO Step
  const renderHealthStep = () => (
    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-8 border border-red-200">
      <div className="flex items-center mb-6">
        <div className="bg-red-500 p-3 rounded-lg mr-4">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saúde e ASO</h2>
          <p className="text-gray-600">Informações médicas e atestados de saúde ocupacional</p>
        </div>
      </div>

      {/* Informações de Saúde */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Heart className="w-5 h-5 text-red-600 mr-2" />
          <h4 className="text-lg font-medium text-red-800">Informações de Saúde</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alergias ou Restrições Médicas
          </label>
          <textarea
            value={formData.dadosPessoais.alergias || ''}
            onChange={(e) => handleInputChange('dadosPessoais', 'alergias', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Descreva alergias, medicamentos em uso, restrições alimentares, etc."
          />
        </div>
      </div>

      {/* Exames ASO */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-gray-600 mr-2" />
          <h4 className="text-lg font-medium text-gray-800">Atestados de Saúde Ocupacional (ASO)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data do Exame Admissional</label>
            <input
              type="date"
              value={formData.aso.admissional.data || ''}
              onChange={(e) => handleNestedInputChange('aso', 'admissional', 'data', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Médico Responsável (Admissional)</label>
            <input
              type="text"
              value={formData.aso.admissional.medico || ''}
              onChange={(e) => handleNestedInputChange('aso', 'admissional', 'medico', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Nome do médico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data do Exame Periódico</label>
            <input
              type="date"
              value={formData.aso.periodico?.data || ''}
              onChange={(e) => handleNestedInputChange('aso', 'periodico', 'data', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Próxima Data (Periódico)</label>
            <input
              type="date"
              value={formData.aso.periodico?.proximaData || ''}
              onChange={(e) => handleNestedInputChange('aso', 'periodico', 'proximaData', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>


    </div>
  )

  // Render Financial Data Step
  const renderFinancialDataStep = () => (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
      <div className="flex items-center mb-6">
        <div className="bg-yellow-500 p-3 rounded-lg mr-4">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dados Financeiros</h2>
          <p className="text-gray-600">Informações sobre salário, benefícios e dependentes</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Dados Bancários */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Dados Bancários
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banco *</label>
              <input
                type="text"
                value={formData.dadosFinanceiros.dadosBancarios.banco}
                onChange={(e) => handleNestedInputChange('dadosFinanceiros', 'dadosBancarios', 'banco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Nome do banco"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agência *</label>
              <input
                type="text"
                value={formData.dadosFinanceiros.dadosBancarios.agencia}
                onChange={(e) => handleNestedInputChange('dadosFinanceiros', 'dadosBancarios', 'agencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="0000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conta *</label>
              <input
                type="text"
                value={formData.dadosFinanceiros.dadosBancarios.conta}
                onChange={(e) => handleNestedInputChange('dadosFinanceiros', 'dadosBancarios', 'conta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="00000-0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta *</label>
              <select
                value={formData.dadosFinanceiros.dadosBancarios.tipoConta}
                onChange={(e) => handleNestedInputChange('dadosFinanceiros', 'dadosBancarios', 'tipoConta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
                <option value="salario">Salário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIX</label>
              <input
                type="text"
                value={formData.dadosFinanceiros.dadosBancarios.pix}
                onChange={(e) => handleNestedInputChange('dadosFinanceiros', 'dadosBancarios', 'pix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
            </div>
          </div>
        </div>



        {/* Dependentes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Dependentes
          </h3>
          {formData.dependentes.map((dependente, index) => (
            <div key={index} className="bg-white p-4 border border-gray-200 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Dependente {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDependente(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={dependente.nome}
                    onChange={(e) => {
                      const newDependentes = [...formData.dependentes]
                      newDependentes[index].nome = e.target.value
                      setFormData({...formData, dependentes: newDependentes})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Nome do dependente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grau de Parentesco</label>
                  <select
                    value={dependente.grauParentesco}
                    onChange={(e) => {
                      const newDependentes = [...formData.dependentes]
                      newDependentes[index].grauParentesco = e.target.value
                      setFormData({...formData, dependentes: newDependentes})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="Cônjuge">Cônjuge</option>
                    <option value="Filho(a)">Filho(a)</option>
                    <option value="Pai">Pai</option>
                    <option value="Mãe">Mãe</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={dependente.dataNascimento}
                    onChange={(e) => {
                      const newDependentes = [...formData.dependentes]
                      newDependentes[index].dataNascimento = e.target.value
                      setFormData({...formData, dependentes: newDependentes})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={dependente.cpf}
                    onChange={(e) => {
                      const newDependentes = [...formData.dependentes]
                      newDependentes[index].cpf = formatCPF(e.target.value)
                      setFormData({...formData, dependentes: newDependentes})
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addDependente}
            className="flex items-center px-4 py-2 text-yellow-600 border border-yellow-300 rounded-lg hover:bg-yellow-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Dependente
          </button>
        </div>
      </div>
    </div>
  )

  // Render Documents Step
  const renderDocumentsStep = () => (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
      <div className="flex items-center mb-6">
        <div className="bg-purple-500 p-3 rounded-lg mr-4">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
          <p className="text-gray-600">Anexos e documentação necessária</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Seção de Documentos Obrigatórios */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            Documentos Obrigatórios
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Faça o upload dos documentos obrigatórios necessários para o cadastro
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ASO - Atestado de Saúde Ocupacional */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                ASO - Atestado de Saúde Ocupacional <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Formatos aceitos: PDF, JPG, PNG | Máx: 10MB</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const newDoc: MandatoryDocument = {
                        id: `aso_${Date.now()}`,
                        name: file.name,
                        type: 'aso',
                        file,
                        status: 'uploaded',
                        uploadDate: new Date().toISOString(),
                        required: true
                      }
                      const updatedDocs = formData.documentosObrigatorios.filter(doc => doc.type !== 'aso')
                      handleMandatoryDocumentUpdate([...updatedDocs, newDoc])
                    }
                  }}
                />
              </div>
              {formData.documentosObrigatorios.find(doc => doc.type === 'aso') && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700">
                      {formData.documentosObrigatorios.find(doc => doc.type === 'aso')?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Comprovante de Residência */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Comprovante de Residência <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Conta de luz, água, telefone ou similar | Máx: 10MB</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const newDoc: MandatoryDocument = {
                        id: `comprovante_residencia_${Date.now()}`,
                        name: file.name,
                        type: 'comprovante_residencia',
                        file,
                        status: 'uploaded',
                        uploadDate: new Date().toISOString(),
                        required: true
                      }
                      const updatedDocs = formData.documentosObrigatorios.filter(doc => doc.type !== 'comprovante_residencia')
                      handleMandatoryDocumentUpdate([...updatedDocs, newDoc])
                    }
                  }}
                />
              </div>
              {formData.documentosObrigatorios.find(doc => doc.type === 'comprovante_residencia') && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700">
                      {formData.documentosObrigatorios.find(doc => doc.type === 'comprovante_residencia')?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Documento de Identificação */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Documento de Identificação <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">RG, CNH ou Passaporte | Máx: 10MB</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const newDoc: MandatoryDocument = {
                        id: `documento_identificacao_${Date.now()}`,
                        name: file.name,
                        type: 'documento_identificacao',
                        file,
                        status: 'uploaded',
                        uploadDate: new Date().toISOString(),
                        required: true
                      }
                      const updatedDocs = formData.documentosObrigatorios.filter(doc => doc.type !== 'documento_identificacao')
                      handleMandatoryDocumentUpdate([...updatedDocs, newDoc])
                    }
                  }}
                />
              </div>
              {formData.documentosObrigatorios.find(doc => doc.type === 'documento_identificacao') && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700">
                      {formData.documentosObrigatorios.find(doc => doc.type === 'documento_identificacao')?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Contrato de Trabalho */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Contrato de Trabalho <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Contrato de trabalho assinado | Máx: 10MB</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const newDoc: MandatoryDocument = {
                        id: `contrato_trabalho_${Date.now()}`,
                        name: file.name,
                        type: 'contrato_trabalho',
                        file,
                        status: 'uploaded',
                        uploadDate: new Date().toISOString(),
                        required: true
                      }
                      const updatedDocs = formData.documentosObrigatorios.filter(doc => doc.type !== 'contrato_trabalho')
                      handleMandatoryDocumentUpdate([...updatedDocs, newDoc])
                    }
                  }}
                />
              </div>
              {formData.documentosObrigatorios.find(doc => doc.type === 'contrato_trabalho') && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700">
                      {formData.documentosObrigatorios.find(doc => doc.type === 'contrato_trabalho')?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo dos documentos obrigatórios */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Status dos Documentos Obrigatórios</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className={`flex items-center ${formData.documentosObrigatorios.find(doc => doc.type === 'aso') ? 'text-green-600' : 'text-red-600'}`}>
                {formData.documentosObrigatorios.find(doc => doc.type === 'aso') ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                ASO
              </div>
              <div className={`flex items-center ${formData.documentosObrigatorios.find(doc => doc.type === 'comprovante_residencia') ? 'text-green-600' : 'text-red-600'}`}>
                {formData.documentosObrigatorios.find(doc => doc.type === 'comprovante_residencia') ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Comprovante
              </div>
              <div className={`flex items-center ${formData.documentosObrigatorios.find(doc => doc.type === 'documento_identificacao') ? 'text-green-600' : 'text-red-600'}`}>
                {formData.documentosObrigatorios.find(doc => doc.type === 'documento_identificacao') ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Identificação
              </div>
              <div className={`flex items-center ${formData.documentosObrigatorios.find(doc => doc.type === 'contrato_trabalho') ? 'text-green-600' : 'text-red-600'}`}>
                {formData.documentosObrigatorios.find(doc => doc.type === 'contrato_trabalho') ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Contrato
              </div>
            </div>
          </div>
        </div>

         {/* Seção de Documentos Adicionais */}
         <div className="bg-white p-6 border border-gray-200 rounded-lg">
           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
             <Plus className="h-5 w-5 mr-2 text-purple-600" />
             Documentos Adicionais
           </h3>
           <div className="space-y-4">
             {formData.documentos.map((documento, index) => (
          <div key={index} className="bg-white p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Documento {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeDocumento(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                <select
                  value={documento.tipo}
                  onChange={(e) => {
                    const newDocumentos = [...formData.documentos]
                    newDocumentos[index].tipo = e.target.value
                    setFormData({...formData, documentos: newDocumentos})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="RG">RG</option>
                  <option value="CPF">CPF</option>
                  <option value="Carteira de Trabalho">Carteira de Trabalho</option>
                  <option value="Comprovante de Residência">Comprovante de Residência</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Certificado">Certificado</option>
                  <option value="Contrato">Contrato</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Arquivo</label>
                <input
                  type="text"
                  value={documento.nome}
                  onChange={(e) => {
                    const newDocumentos = [...formData.documentos]
                    newDocumentos[index].nome = e.target.value
                    setFormData({...formData, documentos: newDocumentos})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome do arquivo"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload do Arquivo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id={`file-upload-${index}`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Arquivo muito grande. Tamanho máximo: 10MB')
                        return
                      }
                      const newDocumentos = [...formData.documentos]
                      newDocumentos[index].arquivo = file
                      newDocumentos[index].nome = newDocumentos[index].nome || file.name
                      setFormData({...formData, documentos: newDocumentos})
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor={`file-upload-${index}`} className="cursor-pointer">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  {documento.arquivo ? (
                    <div>
                      <p className="text-sm text-green-600 font-medium">{documento.arquivo.name}</p>
                      <p className="text-xs text-gray-500">Arquivo selecionado</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Clique para fazer upload ou arraste o arquivo aqui</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        ))}
        
             <button
               type="button"
               onClick={addDocumento}
               className="flex items-center px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
             >
               <Plus className="h-4 w-4 mr-2" />
               Adicionar Documento
             </button>
           </div>
         </div>

         {/* Responsável RH */}
         <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
           <h4 className="font-medium text-gray-900 mb-3 flex items-center">
             <User className="h-5 w-5 mr-2 text-blue-600" />
             Responsável RH
           </h4>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Responsável</label>
             <input
               type="text"
               value={formData.responsavelRH}
               onChange={(e) => setFormData(prev => ({ ...prev, responsavelRH: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="Nome do responsável pelo RH"
             />
           </div>
         </div>
       </div>
     </div>
   )

  // Render Anexos Step
  const renderAnexosStep = () => (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200">
      <div className="flex items-center mb-6">
        <div className="bg-orange-500 p-3 rounded-lg mr-4">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Anexos</h2>
          <p className="text-gray-600">Arquivos adicionais e complementares</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Seção de Upload de Anexos */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-orange-600" />
            Adicionar Anexos
          </h3>
          
          <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
            <FileText className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Arraste arquivos aqui ou clique para selecionar</h4>
            <p className="text-gray-500 mb-4">Suporte para PDF, DOC, DOCX, JPG, PNG (máx. 10MB por arquivo)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              id="anexos-upload"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                files.forEach(file => {
                  if (file.size > 10 * 1024 * 1024) {
                    alert(`Arquivo ${file.name} é muito grande. Máximo 10MB.`)
                    return
                  }
                  
                  const novoAnexo = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    nome: file.name,
                    tipo: file.type,
                    arquivo: file,
                    data: new Date().toISOString().split('T')[0],
                    descricao: '',
                    categoria: 'outros' as const
                  }
                  
                  setFormData(prev => ({
                    ...prev,
                    anexos: [...(prev.anexos || []), novoAnexo]
                  }))
                })
                
                // Reset input
                e.target.value = ''
              }}
            />
            <label
              htmlFor="anexos-upload"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Selecionar Arquivos
            </label>
          </div>
        </div>

        {/* Lista de Anexos - Campos Individuais */}
        {formData.anexos && formData.anexos.length > 0 && (
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Anexos Adicionados ({formData.anexos.length})
            </h3>
            
            <div className="space-y-6">
              {formData.anexos.map((anexo, index) => (
                <div key={anexo.id} className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-2 border-orange-200 rounded-xl shadow-sm">
                  {/* Cabeçalho do Anexo */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">Anexo #{index + 1}</h4>
                        <p className="text-sm text-gray-600">{anexo.nome}</p>
                        <p className="text-xs text-gray-500">
                          {anexo.arquivo ? `${(anexo.arquivo.size / 1024 / 1024).toFixed(2)} MB` : 'Tamanho não disponível'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          anexos: prev.anexos?.filter(a => a.id !== anexo.id) || []
                        }))
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 p-2 rounded-lg transition-colors"
                      title="Remover anexo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Campos do Anexo */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Categoria do Anexo
                        </label>
                        <select
                          value={anexo.categoria}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              anexos: prev.anexos?.map(a => 
                                a.id === anexo.id 
                                  ? { ...a, categoria: e.target.value as any }
                                  : a
                              ) || []
                            }))
                          }}
                          className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm font-medium"
                        >
                          <option value="contrato">📄 Contrato</option>
                          <option value="documento_pessoal">🆔 Documento Pessoal</option>
                          <option value="certificado">🏆 Certificado</option>
                          <option value="outros">📎 Outros</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Nome/Título do Arquivo
                        </label>
                        <input
                          type="text"
                          value={anexo.nome}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              anexos: prev.anexos?.map(a => 
                                a.id === anexo.id 
                                  ? { ...a, nome: e.target.value }
                                  : a
                              ) || []
                            }))
                          }}
                          className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          placeholder="Ex: Contrato de Trabalho, RG, Diploma..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Descrição Detalhada
                      </label>
                      <textarea
                        value={anexo.descricao}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            anexos: prev.anexos?.map(a => 
                              a.id === anexo.id 
                                ? { ...a, descricao: e.target.value }
                                : a
                            ) || []
                          }))
                        }}
                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
                        rows={3}
                        placeholder="Descreva o conteúdo e a finalidade deste anexo..."
                      />
                    </div>
                    
                    {/* Informações do Arquivo */}
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h5 className="font-medium text-gray-800 mb-2">Informações do Arquivo:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Tipo:</span>
                          <p className="text-gray-800">{anexo.tipo || 'Não especificado'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Data de Upload:</span>
                          <p className="text-gray-800">{anexo.data || 'Hoje'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Status:</span>
                          <p className="text-green-600 font-medium">✅ Anexado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações sobre os Anexos</h3>
          <textarea
            value={formData.observacoesAnexos || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoesAnexos: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={4}
            placeholder="Adicione observações sobre os anexos enviados..."
          />
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalDataStep()
      case 2:
        return renderProfessionalDataStep()
      case 3:
        return renderWorkScheduleStep()
      case 4:
        return renderHealthStep()
      case 5:
        return renderFinancialDataStep()
      case 6:
        return renderDocumentsStep()
      case 7:
        return renderAnexosStep()
      default:
        return renderPersonalDataStep()
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Colaborador</h1>
        <p className="text-gray-600">Preencha as informações do novo colaborador do time interno</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="min-h-[600px]">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancelar
            </button>

            {currentStep === totalSteps ? (
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-200 font-medium"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Salvar Colaborador
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-medium"
              >
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default TimeInternoForm