import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, CreateTaskRequest, UpdateTaskRequest, RecurrenceRule } from '../../types/task';
import { Project } from '../../types/project';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  FolderOpen, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Users,
  Settings,
  Target,
  Home,
  ChevronRight as BreadcrumbArrow
} from 'lucide-react';
import UserSelector from './UserSelector';
import RecurrenceConfig from './RecurrenceConfig';
import projectService from '../../utils/projectService';
import { Breadcrumb } from '../UI/Breadcrumb';

interface TaskParticipant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

// Mock de usuários do time interno
const mockInternalTeam: TaskParticipant[] = [
  { id: '1', name: 'João Silva', role: 'Analista Comercial' },
  { id: '2', name: 'Maria Santos', role: 'Gerente Operacional' },
  { id: '3', name: 'Pedro Costa', role: 'Analista Financeiro' },
  { id: '4', name: 'Ana Lima', role: 'Coordenadora RH' },
  { id: '5', name: 'Carlos Oliveira', role: 'Desenvolvedor' },
  { id: '6', name: 'Lucia Ferreira', role: 'Designer UX' }
];

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    assignedTo: [] as string[],
    participants: [] as string[],
    dueDate: '',
    tags: [] as string[],
    category: '',
    project: '',
    estimatedHours: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>();

  // Configuração dos steps
  const steps = [
    { id: 1, title: 'Informações Básicas', icon: Target, description: 'Título, descrição e prioridade' },
    { id: 2, title: 'Responsáveis', icon: Users, description: 'Atribuição e participantes' },
    { id: 3, title: 'Planejamento', icon: Calendar, description: 'Prazos, projeto e categoria' },
    { id: 4, title: 'Configurações', icon: Settings, description: 'Tags, recorrência e detalhes' }
  ];

  // Funções de navegação entre steps
  const nextStep = () => {
    // Validar campos do step atual antes de avançar
    const stepValidation = validateCurrentStep()
    
    if (stepValidation && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  // Navegação direta para um step específico
  const goToStep = (stepNumber: number) => {
    // Permitir navegação para steps anteriores ou atual
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
      return;
    }
    
    // Para steps futuros, validar steps anteriores
    const originalStep = currentStep;
    let canNavigate = true;
    
    for (let i = 1; i < stepNumber; i++) {
      setCurrentStep(i);
      if (!validateCurrentStep()) {
        canNavigate = false;
        break;
      }
    }
    
    if (canNavigate) {
      setCurrentStep(stepNumber);
    } else {
      setCurrentStep(originalStep); // Restaurar step original
    }
  }

  // Validação específica por step
  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    switch (currentStep) {
      case 1: // Informações Básicas
        newErrors.title = validateField('title', formData.title)
        newErrors.description = validateField('description', formData.description)
        break
      
      case 2: // Atribuição
        newErrors.assignedTo = validateField('assignedTo', formData.assignedTo.length > 0 ? formData.assignedTo[0] : '')
        newErrors.priority = validateField('priority', formData.priority)
        break
      
      case 3: // Planejamento
        newErrors.dueDate = validateField('dueDate', formData.dueDate)
        newErrors.estimatedHours = validateField('estimatedHours', formData.estimatedHours)
        break
      
      case 4: // Configurações
        // Validações opcionais para o último step
        break
    }
    
    // Filtrar apenas erros não vazios
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    )
    
    setErrors(prev => ({ ...prev, ...filteredErrors }))
    
    return Object.keys(filteredErrors).length === 0
   }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Load projects when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const activeProjects = await projectService.getActiveProjects();
        setProjects(activeProjects);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assignedTo: task.assignedTo ? [task.assignedTo] : [],
        participants: [],
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        tags: [...task.tags],
        category: task.category || '',
        project: task.project || '',
        estimatedHours: task.estimatedHours?.toString() || ''
      });
      setIsRecurring(task.isRecurring || false);
      setRecurrenceRule(task.recurrenceRule);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        assignedTo: [],
        participants: [],
        dueDate: '',
        tags: [],
        category: '',
        project: '',
        estimatedHours: ''
      });
      setIsRecurring(false);
      setRecurrenceRule(undefined);
    }
    setErrors({});
    setCurrentStep(1); // Reset para o primeiro step
  }, [task, isOpen]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Arrow keys para navegação entre steps
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            if (currentStep > 1) {
              prevStep()
            }
            break
          case 'ArrowRight':
            e.preventDefault()
            if (currentStep < totalSteps) {
              nextStep()
            }
            break
          case 'Enter':
            // Ctrl/Cmd + Enter para submeter formulário
            if (currentStep === totalSteps) {
              e.preventDefault()
              const form = document.querySelector('form')
              if (form) {
                form.requestSubmit()
              }
            }
            break
        }
      }
      
      // Escape para fechar modal
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, currentStep, totalSteps, onClose])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validação em tempo real
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Formatação de horas
  const formatHours = (value: string): string => {
    const numericValue = value.replace(/[^\d]/g, '')
    if (numericValue.length <= 2) {
      return numericValue
    }
    return `${numericValue.slice(0, -2)}:${numericValue.slice(-2)}`
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHours(e.target.value)
    setFormData(prev => ({ ...prev, estimatedHours: formatted }))
    
    // Validação em tempo real
    const error = validateField('estimatedHours', formatted)
    setErrors(prev => ({ ...prev, estimatedHours: error }))
  }

  // Formatação de texto (capitalização)
  const formatText = (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  // Validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validação de URL
  const validateURL = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Validação em tempo real
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'title':
        if (!value || value.trim().length < 3) {
          return 'Título deve ter pelo menos 3 caracteres'
        }
        if (value.length > 100) {
          return 'Título deve ter no máximo 100 caracteres'
        }
        return ''
      
      case 'description':
        if (value && value.length > 500) {
          return 'Descrição deve ter no máximo 500 caracteres'
        }
        return ''
      
      case 'estimatedHours':
        if (value && !/^\d{1,2}:\d{2}$/.test(value)) {
          return 'Formato deve ser HH:MM'
        }
        if (value) {
          const [hours, minutes] = value.split(':').map(Number)
          if (hours > 23 || minutes > 59) {
            return 'Horário inválido'
          }
          if (hours === 0 && minutes === 0) {
            return 'Tempo estimado deve ser maior que 0'
          }
        }
        return ''
      
      case 'assignedTo':
        if (!value) {
          return 'Responsável é obrigatório'
        }
        return ''
      
      case 'dueDate':
        if (value) {
          const selectedDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (selectedDate < today) {
            return 'Data de vencimento não pode ser no passado'
          }
        }
        return ''
      
      case 'priority':
        if (!value) {
          return 'Prioridade é obrigatória'
        }
        return ''
      
      default:
        return ''
    }
  }

  // Validação completa do formulário
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    // Validações obrigatórias baseadas no step atual
    if (currentStep >= 1) {
      newErrors.title = validateField('title', formData.title)
      newErrors.description = validateField('description', formData.description)
    }
    
    if (currentStep >= 2) {
      newErrors.assignedTo = validateField('assignedTo', formData.assignedTo)
      newErrors.priority = validateField('priority', formData.priority)
    }
    
    if (currentStep >= 3) {
      newErrors.dueDate = validateField('dueDate', formData.dueDate)
      newErrors.estimatedHours = validateField('estimatedHours', formData.estimatedHours)
    }
    
    setErrors(newErrors)
    
    // Retorna true se não há erros
    return Object.values(newErrors).every(error => !error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const submitData: CreateTaskRequest | UpdateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo[0] : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: formData.tags,
        category: formData.category.trim() || undefined,
        project: formData.project.trim() || undefined,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        isRecurring: isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule : undefined
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar indicador de steps
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isAccessible = step.id <= currentStep || isCompleted;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={!isAccessible}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : 
                    isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : 
                    isAccessible ? 'bg-gray-300 text-gray-600 hover:bg-gray-400' :
                    'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  ${isAccessible ? 'hover:scale-105 cursor-pointer' : ''}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                aria-label={`Ir para ${step.title}`}
                tabIndex={isAccessible ? 0 : -1}
              >
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
              </button>
              <div className="text-center">
                <p className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 
                  isAccessible ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs mt-1 max-w-24 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-500'
                }`}>
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
          );
        })}
      </div>
    </div>
  );

  // Step 1: Informações Básicas
  const renderBasicInfoStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Informações Básicas</h3>
            <p className="text-blue-600 text-sm mt-1">Defina o título, descrição e prioridade da tarefa</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className={`form-field ${errors.title ? 'error' : ''}`}>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.title 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Digite o título da tarefa"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="w-4 h-4 mr-1">⚠️</span>
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className={`form-field ${errors.description ? 'error' : ''}`}>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.description 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Descreva a tarefa em detalhes"
          />
          <div className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 caracteres
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="w-4 h-4 mr-1">⚠️</span>
              {errors.description}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Prioridade
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value={TaskPriority.LOW}>Baixa</option>
            <option value={TaskPriority.MEDIUM}>Média</option>
            <option value={TaskPriority.HIGH}>Alta</option>
            <option value={TaskPriority.URGENT}>Urgente</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 2: Responsáveis
  const renderAssignmentStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Responsáveis</h3>
            <p className="text-green-600 text-sm mt-1">Defina quem será responsável e participantes da tarefa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`form-field ${errors.assignedTo ? 'error' : ''}`}>
           <UserSelector
             label="Responsável *"
             selectedUsers={formData.assignedTo}
             onSelectionChange={(userIds) => {
               setFormData(prev => ({ ...prev, assignedTo: userIds }));
               const error = validateField('assignedTo', userIds.length > 0 ? userIds[0] : '');
               setErrors(prev => ({ ...prev, assignedTo: error }));
             }}
             multiple={false}
             placeholder="Selecione um responsável"
           />
           {errors.assignedTo && (
             <p className="mt-1 text-sm text-red-600 flex items-center">
               <span className="w-4 h-4 mr-1">⚠️</span>
               {errors.assignedTo}
             </p>
           )}
         </div>

        <div className="form-field">
          <UserSelector
            label="Participantes"
            selectedUsers={formData.participants}
            onSelectionChange={(userIds) => setFormData(prev => ({ ...prev, participants: userIds }))}
            multiple={true}
            placeholder="Selecione participantes"
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Planejamento
  const renderPlanningStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-lg mr-3">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-800">Planejamento</h3>
            <p className="text-purple-600 text-sm mt-1">Configure prazos, projeto e categoria da tarefa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Due Date */}
        <div className={`form-field ${errors.dueDate ? 'error' : ''}`}>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Prazo da Tarefa
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.dueDate 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="w-4 h-4 mr-1">⚠️</span>
              {errors.dueDate}
            </p>
          )}
        </div>

        {/* Estimated Hours */}
        <div className={`form-field ${errors.estimatedHours ? 'error' : ''}`}>
           <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
             <Clock className="w-4 h-4 inline mr-1" />
             Horas Estimadas (HH:MM)
           </label>
           <input
             type="text"
             id="estimatedHours"
             name="estimatedHours"
             value={formData.estimatedHours}
             onChange={handleHoursChange}
             maxLength={5}
             className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
               errors.estimatedHours 
                 ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                 : 'border-gray-300 hover:border-gray-400'
             }`}
             placeholder="Ex: 02:30"
           />
           <div className="mt-1 text-xs text-gray-500">
             Formato: HH:MM (ex: 02:30 para 2 horas e 30 minutos)
           </div>
           {errors.estimatedHours && (
             <p className="mt-1 text-sm text-red-600 flex items-center">
               <span className="w-4 h-4 mr-1">⚠️</span>
               {errors.estimatedHours}
             </p>
           )}
         </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: Desenvolvimento, Design"
          />
        </div>

        {/* Project */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
            <FolderOpen className="w-4 h-4 inline mr-1" />
            Projeto
          </label>
          <select
            id="project"
            name="project"
            value={formData.project}
            onChange={handleInputChange}
            disabled={loadingProjects}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingProjects ? 'Carregando projetos...' : 'Selecione um projeto'}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Step 4: Configurações
  const renderConfigStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center">
          <div className="bg-orange-100 p-2 rounded-lg mr-3">
            <Settings className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-800">Configurações</h3>
            <p className="text-orange-600 text-sm mt-1">Configure tags, recorrência e detalhes adicionais</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Digite uma tag e pressione Enter"
          />
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recorrência */}
        <div>
          <RecurrenceConfig
            recurrenceRule={recurrenceRule}
            onChange={setRecurrenceRule}
            isEnabled={isRecurring}
            onToggle={setIsRecurring}
          />
        </div>
      </div>
    </div>
  );

  // Renderizar conteúdo do step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderAssignmentStep();
      case 3:
        return renderPlanningStep();
      case 4:
        return renderConfigStep();
      default:
        return renderBasicInfoStep();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[98vh] sm:max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">
                {task ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base hidden sm:block">
                {task ? 'Atualize as informações da tarefa' : 'Preencha os dados para criar uma nova tarefa'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors ml-4 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {/* Breadcrumb Navigation */}
           <div className="border-t border-blue-400 pt-4">
             <Breadcrumb
               items={[
                 { label: 'Tarefas', path: '/tasks' },
                 { label: task ? 'Editar' : 'Nova Tarefa' }
               ]}
               showHome={false}
               className="text-blue-100 [&_a]:text-blue-100 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-blue-300"
             />
           </div>
        </div>

        {/* Step Indicator */}
        <div className="p-4 sm:p-6 pb-4 flex-shrink-0">
          {renderStepIndicator()}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderCurrentStep()}
          </form>
        </div>

        {/* Footer with Navigation - Fixed at bottom */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Botão Anterior */}
            <div className="flex justify-start w-full sm:w-auto">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  title="Anterior (Ctrl/Cmd + ←)"
                  className="flex items-center px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant.</span>
                </button>
              )}
            </div>

            {/* Indicador de Etapa com dicas de navegação */}
            <div className="text-center">
              <div className="text-sm text-gray-500 font-medium">
                Etapa {currentStep} de {totalSteps}
              </div>
              <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                Use Ctrl/Cmd + ← → para navegar
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                title="Cancelar (Esc)"
                className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <span className="hidden sm:inline">Cancelar</span>
                <span className="sm:hidden">Cancel.</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  title="Próximo (Ctrl/Cmd + →)"
                  className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <span className="sm:hidden">Próx.</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                   type="submit"
                   disabled={isSubmitting}
                   title="Salvar Tarefa (Ctrl/Cmd + Enter)"
                   className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                   onClick={handleSubmit}
                 >
                   {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">Salvando...</span>
                      <span className="sm:hidden">Salv...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">{task ? 'Atualizar' : 'Criar Tarefa'}</span>
                      <span className="sm:hidden">{task ? 'Atualizar' : 'Criar'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;