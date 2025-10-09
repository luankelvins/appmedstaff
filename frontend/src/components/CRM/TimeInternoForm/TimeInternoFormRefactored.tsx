import React, { useState, useEffect, useCallback } from 'react'
import { 
  User, 
  Briefcase, 
  Clock, 
  Shield, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  DollarSign,
  Users,
  Save,
  X
} from 'lucide-react'
import { TimeInternoForm } from '../../../types/crm'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { LoadingButton, LoadingOverlay } from '../../UI/LoadingStates'
import { ErrorBoundary } from '../../ErrorBoundary/ErrorBoundary'
import { DadosPessoaisSection } from './DadosPessoaisSection'
import { DadosProfissionaisSection } from './DadosProfissionaisSection'

interface TimeInternoFormRefactoredProps {
  initialData?: Partial<TimeInternoForm>
  onSubmit: (data: TimeInternoForm) => void
  onCancel: () => void
  isLoading?: boolean
}

const STEPS = [
  { id: 1, title: 'Dados Pessoais', icon: User, description: 'Informações básicas do funcionário' },
  { id: 2, title: 'Dados Profissionais', icon: Briefcase, description: 'Cargo, departamento e contrato' },
  { id: 3, title: 'Jornada de Trabalho', icon: Clock, description: 'Horários e escala de trabalho' },
  { id: 4, title: 'Dados Financeiros', icon: DollarSign, description: 'Salário e benefícios' },
  { id: 5, title: 'Documentos', icon: FileText, description: 'Documentos obrigatórios e anexos' },
  { id: 6, title: 'Revisão', icon: CheckCircle, description: 'Revisar e confirmar dados' }
]

export function TimeInternoFormRefactored({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: TimeInternoFormRefactoredProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TimeInternoForm>({
    id: initialData?.id || '',
    numeroRegistro: initialData?.numeroRegistro || '',
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
      cargaHoraria: 40,
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
    documentosObrigatorios: [],
    documentos: [],
    anexosNotificacoes: [],
    anexos: [],
    observacoesAnexos: '',
    status: 'ativo',
    responsavelRH: '',
    perfilEditavel: true,
    observacoes: '',
    comments: []
  })

  const validationRules = {
    'dadosPessoais.nome': { required: true, minLength: 2 },
    'dadosPessoais.cpf': { required: true },
    'dadosPessoais.dataNascimento': { required: true },
    'dadosPessoais.telefone': { required: true },
    'dadosPessoais.emailPessoal': { required: true },
    'dadosProfissionais.cargo': { required: true },
    'dadosProfissionais.departamento': { required: true },
    'dadosProfissionais.gestorResponsavel': { required: true },
    'dadosProfissionais.dataAdmissao': { required: true },
    'dadosProfissionais.salario': { required: true }
  }

  const { 
    errors, 
    touched, 
    isFormValid, 
    validateAll, 
    handleFieldChange, 
    handleFieldBlur, 
    resetValidation 
  } = useFormValidation({
    validationRules,
    validateOnChange: true,
    validateOnBlur: true
  })

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = field.split('.')
      let current = newData as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
    
    handleFieldChange(field, value)
  }, [handleFieldChange])

  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step)
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateAll(formData)
    if (!validation.isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao salvar formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, validateAll])

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DadosPessoaisSection
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
            touched={touched}
          />
        )
      case 2:
        return (
          <DadosProfissionaisSection
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
            touched={touched}
          />
        )
      case 3:
        return <div>Jornada de Trabalho (Em desenvolvimento)</div>
      case 4:
        return <div>Dados Financeiros (Em desenvolvimento)</div>
      case 5:
        return <div>Documentos (Em desenvolvimento)</div>
      case 6:
        return <div>Revisão (Em desenvolvimento)</div>
      default:
        return null
    }
  }

  const canProceed = () => {
    // Add step-specific validation logic here
    return true
  }

  const canGoBack = () => {
    return currentStep > 1
  }

  const isLastStep = () => {
    return currentStep === STEPS.length
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Cadastro de Funcionário
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Passo {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].title}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <LoadingOverlay loading={isSubmitting} message="Salvando dados...">
            {renderStepContent()}
          </LoadingOverlay>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <div>
              {canGoBack() && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>

              {isLastStep() ? (
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isFormValid || isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Funcionário
                </LoadingButton>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  )
}
