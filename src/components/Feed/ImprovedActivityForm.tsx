import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Calendar, MapPin, Users, Clock, FileText, Package, 
  AlertCircle, CheckCircle, Info, Star, Eye, EyeOff,
  Plus, Minus, Save, Send, ArrowRight, ArrowLeft
} from 'lucide-react';
import { ActivityFormData, Priority, ActivityStatus, ActivityCategory } from '../../types/feed';

interface ImprovedActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  initialData?: Partial<ActivityFormData>;
  isEditing?: boolean;
}

const ImprovedActivityForm: React.FC<ImprovedActivityFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch,
    setValue,
    trigger,
    clearErrors
  } = useForm<ActivityFormData>({
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'planned',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate,
      location: initialData?.location || '',
      category: initialData?.category || 'meeting',
      maxParticipants: initialData?.maxParticipants,
      requiresConfirmation: initialData?.requiresConfirmation || false,
      instructions: initialData?.instructions || '',
      materials: initialData?.materials || [],
      tags: initialData?.tags || [],
      isPublic: initialData?.isPublic ?? true,
      targetAudience: initialData?.targetAudience || []
    }
  });

  const watchedValues = watch();
  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchPriority = watch('priority');

  // Validação em tempo real
  useEffect(() => {
    const validateField = async (fieldName: string, value: any) => {
      const newErrors = { ...validationErrors };
      
      switch (fieldName) {
        case 'title':
          if (!value || value.trim().length < 3) {
            newErrors.title = 'Título deve ter pelo menos 3 caracteres';
          } else if (value.length > 100) {
            newErrors.title = 'Título não pode exceder 100 caracteres';
          } else {
            delete newErrors.title;
          }
          break;
        case 'description':
          if (!value || value.trim().length < 10) {
            newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
          } else if (value.length > 500) {
            newErrors.description = 'Descrição não pode exceder 500 caracteres';
          } else {
            delete newErrors.description;
          }
          break;
        case 'endDate':
          if (value && watchStartDate && new Date(value) <= new Date(watchStartDate)) {
            newErrors.endDate = 'Data de término deve ser posterior à data de início';
          } else {
            delete newErrors.endDate;
          }
          break;
      }
      
      setValidationErrors(newErrors);
    };

    Object.entries(watchedValues).forEach(([key, value]) => {
      if (touchedFields[key as keyof ActivityFormData]) {
        validateField(key, value);
      }
    });
  }, [watchedValues, touchedFields, watchStartDate]);

  const handleFormSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags: selectedTags,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined
      });
      reset();
      setSelectedTags([]);
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 ? ['title', 'description'] : [];
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid && Object.keys(validationErrors).length === 0) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getFieldStatus = (fieldName: string) => {
    const hasError = errors[fieldName as keyof typeof errors] || validationErrors[fieldName];
    const isTouched = touchedFields[fieldName as keyof typeof touchedFields];
    const hasValue = watchedValues[fieldName as keyof typeof watchedValues];

    if (hasError) return 'error';
    if (isTouched && hasValue) return 'success';
    return 'default';
  };

  const getInputClasses = (fieldName: string) => {
    const status = getFieldStatus(fieldName);
    const baseClasses = 'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';
    
    switch (status) {
      case 'error':
        return `${baseClasses} border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500`;
      case 'success':
        return `${baseClasses} border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500`;
      default:
        return `${baseClasses} border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header com progresso */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Indicador de progresso */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Informações Básicas</span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-300" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Detalhes e Configurações</span>
            </div>
          </div>
        </div>

        {/* Conteúdo do formulário */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Título da Atividade
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('title', { 
                        required: 'Título é obrigatório',
                        minLength: { value: 3, message: 'Título deve ter pelo menos 3 caracteres' },
                        maxLength: { value: 100, message: 'Título não pode exceder 100 caracteres' }
                      })}
                      className={getInputClasses('title')}
                      placeholder="Ex: Reunião de planejamento estratégico"
                    />
                    {getFieldStatus('title') === 'success' && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {getFieldStatus('title') === 'error' && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">
                      {errors.title?.message || validationErrors.title}
                    </span>
                    <span className="text-gray-500">
                      {watchedValues.title?.length || 0}/100
                    </span>
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Descrição
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description', { 
                        required: 'Descrição é obrigatória',
                        minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' },
                        maxLength: { value: 500, message: 'Descrição não pode exceder 500 caracteres' }
                      })}
                      rows={4}
                      className={getInputClasses('description')}
                      placeholder="Descreva os objetivos, agenda e informações importantes da atividade..."
                    />
                    {getFieldStatus('description') === 'success' && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {getFieldStatus('description') === 'error' && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">
                      {errors.description?.message || validationErrors.description}
                    </span>
                    <span className="text-gray-500">
                      {watchedValues.description?.length || 0}/500
                    </span>
                  </div>
                </div>

                {/* Prioridade com visual melhorado */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Star className="h-4 w-4 mr-2 text-blue-600" />
                    Prioridade
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'low', label: 'Baixa', color: 'green', icon: '🟢' },
                      { value: 'medium', label: 'Média', color: 'yellow', icon: '🟡' },
                      { value: 'high', label: 'Alta', color: 'orange', icon: '🟠' },
                      { value: 'urgent', label: 'Urgente', color: 'red', icon: '🔴' }
                    ].map((priority) => (
                      <label
                        key={priority.value}
                        className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          watchPriority === priority.value 
                            ? getPriorityColor(priority.value as Priority)
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          {...register('priority')}
                          value={priority.value}
                          className="sr-only"
                        />
                        <span className="text-lg mr-2">{priority.icon}</span>
                        <span className="text-sm font-medium">{priority.label}</span>
                        {watchPriority === priority.value && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Package className="h-4 w-4 mr-2 text-blue-600" />
                    Categoria
                  </label>
                  <select
                    {...register('category')}
                    className={getInputClasses('category')}
                  >
                    <option value="meeting">📋 Reunião</option>
                    <option value="training">🎓 Treinamento</option>
                    <option value="workshop">🔧 Workshop</option>
                    <option value="presentation">📊 Apresentação</option>
                    <option value="social">🎉 Social</option>
                    <option value="other">📌 Outro</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      Data de Início
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register('startDate', { required: 'Data de início é obrigatória' })}
                      className={getInputClasses('startDate')}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      Data de Término
                    </label>
                    <input
                      type="datetime-local"
                      {...register('endDate')}
                      className={getInputClasses('endDate')}
                    />
                    {validationErrors.endDate && (
                      <p className="text-xs text-red-600">{validationErrors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Local e Participantes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      Local
                    </label>
                    <input
                      type="text"
                      {...register('location')}
                      className={getInputClasses('location')}
                      placeholder="Ex: Sala de reuniões A, Online, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      Máximo de Participantes
                    </label>
                    <input
                      type="number"
                      {...register('maxParticipants')}
                      className={getInputClasses('maxParticipants')}
                      placeholder="Deixe vazio para ilimitado"
                      min="1"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite uma tag e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Configurações avançadas */}
                <div className="border-t pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
                  >
                    {showAdvanced ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showAdvanced ? 'Ocultar' : 'Mostrar'} configurações avançadas
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('requiresConfirmation')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">
                          Requer confirmação de participação
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('isPublic')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">
                          Atividade pública (visível para todos)
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Instruções especiais
                        </label>
                        <textarea
                          {...register('instructions')}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Instruções adicionais para os participantes..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer com botões */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!watchedValues.title || !watchedValues.description || Object.keys(validationErrors).length > 0}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit(handleFormSubmit)}
                  disabled={isSubmitting || !isValid}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar' : 'Criar'} Atividade
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

export default ImprovedActivityForm;