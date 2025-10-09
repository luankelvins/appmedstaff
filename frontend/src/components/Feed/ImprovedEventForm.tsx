import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Calendar, Clock, MapPin, Users, Tag, Link, Bell, 
  CheckCircle, AlertTriangle, Save, Send, Video, Repeat,
  Plus, Minus, Eye, EyeOff
} from 'lucide-react';
import { EventFormData, Priority, EventCategory } from '../../types/feed';

interface ImprovedEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: Partial<EventFormData>;
  isEditing?: boolean;
}

const ImprovedEventForm: React.FC<ImprovedEventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [reminders, setReminders] = useState(initialData?.reminders || []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch,
    setValue
  } = useForm<EventFormData>({
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || new Date(),
      isAllDay: initialData?.isAllDay || false,
      location: initialData?.location || '',
      meetingLink: initialData?.meetingLink || '',
      category: initialData?.category || 'meeting',
      attendees: initialData?.attendees || [],
      isPublic: initialData?.isPublic ?? true,
      tags: initialData?.tags || []
    }
  });

  const watchedValues = watch();
  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchIsAllDay = watch('isAllDay');
  const watchCategory = watch('category');

  // Validação em tempo real
  useEffect(() => {
    const validateField = (fieldName: string, value: any) => {
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
          } else if (value.length > 1000) {
            newErrors.description = 'Descrição não pode exceder 1000 caracteres';
          } else {
            delete newErrors.description;
          }
          break;
        case 'startDate':
        case 'endDate':
          if (watchStartDate && watchEndDate && new Date(watchEndDate) <= new Date(watchStartDate)) {
            newErrors.endDate = 'Data de fim deve ser posterior à data de início';
          } else {
            delete newErrors.endDate;
          }
          break;
        case 'meetingLink':
          if (value && !value.match(/^https?:\/\/.+/)) {
            newErrors.meetingLink = 'Link deve começar com http:// ou https://';
          } else {
            delete newErrors.meetingLink;
          }
          break;
      }
      
      setValidationErrors(newErrors);
    };

    Object.entries(watchedValues).forEach(([key, value]) => {
      if (touchedFields[key as keyof EventFormData]) {
        validateField(key, value);
      }
    });
  }, [watchedValues, touchedFields, watchStartDate, watchEndDate]);

  const handleFormSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags: selectedTags,
        reminders,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      });
      reset();
      setSelectedTags([]);
      setReminders([]);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
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

  const addReminder = () => {
    setReminders([...reminders, {
      type: 'email',
      minutesBefore: 15,
      isActive: true
    }]);
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (index: number, field: string, value: any) => {
    const updatedReminders = [...reminders];
    updatedReminders[index] = { ...updatedReminders[index], [field]: value };
    setReminders(updatedReminders);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 text-red-700';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-green-500 bg-green-50 text-green-700';
      default: return 'border-gray-300 bg-white text-gray-700';
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

  const formatDateTime = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Editar Evento' : 'Novo Evento'}
                </h2>
                <p className="text-blue-100 text-sm">
                  Organize reuniões, workshops e eventos importantes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-6">
            {/* Abas */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !showPreview 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✏️ Editar
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  showPreview 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👁️ Visualizar
              </button>
            </div>

            {!showPreview ? (
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    Título do Evento
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
                    Descrição
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description', { 
                        required: 'Descrição é obrigatória',
                        minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' },
                        maxLength: { value: 1000, message: 'Descrição não pode exceder 1000 caracteres' }
                      })}
                      rows={4}
                      className={getInputClasses('description')}
                      placeholder="Descreva o objetivo, agenda e informações importantes do evento..."
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">
                      {errors.description?.message || validationErrors.description}
                    </span>
                    <span className="text-gray-500">
                      {watchedValues.description?.length || 0}/1000
                    </span>
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    Data e Horário
                  </h3>

                  {/* Evento de dia inteiro */}
                  <label className="flex items-center p-3 bg-white border border-blue-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isAllDay')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                    />
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Evento de dia inteiro</span>
                      <p className="text-xs text-gray-600">Não especifica horários de início e fim</p>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data/Hora de início */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {watchIsAllDay ? 'Data de Início' : 'Data e Hora de Início'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type={watchIsAllDay ? 'date' : 'datetime-local'}
                        {...register('startDate', { required: 'Data de início é obrigatória' })}
                        className={getInputClasses('startDate')}
                      />
                    </div>

                    {/* Data/Hora de fim */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {watchIsAllDay ? 'Data de Fim' : 'Data e Hora de Fim'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type={watchIsAllDay ? 'date' : 'datetime-local'}
                        {...register('endDate', { required: 'Data de fim é obrigatória' })}
                        className={getInputClasses('endDate')}
                      />
                      {validationErrors.endDate && (
                        <p className="text-xs text-red-600">{validationErrors.endDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Localização e Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Localização */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      Localização
                    </label>
                    <input
                      type="text"
                      {...register('location')}
                      className={getInputClasses('location')}
                      placeholder="Ex: Sala de reuniões A, 2º andar"
                    />
                  </div>

                  {/* Link da reunião */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Video className="h-4 w-4 mr-2 text-blue-600" />
                      Link da Reunião
                    </label>
                    <input
                      type="url"
                      {...register('meetingLink')}
                      className={getInputClasses('meetingLink')}
                      placeholder="https://meet.google.com/..."
                    />
                    {validationErrors.meetingLink && (
                      <p className="text-xs text-red-600">{validationErrors.meetingLink}</p>
                    )}
                  </div>
                </div>

                {/* Categoria e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categoria */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Tag className="h-4 w-4 mr-2 text-blue-600" />
                      Categoria
                    </label>
                    <select
                      {...register('category')}
                      className={getInputClasses('category')}
                    >
                      <option value="meeting">🤝 Reunião</option>
                      <option value="workshop">🎓 Workshop</option>
                      <option value="training">📚 Treinamento</option>
                      <option value="conference">🎤 Conferência</option>
                      <option value="social">🎉 Social</option>
                      <option value="deadline">⏰ Prazo</option>
                      <option value="other">📋 Outro</option>
                    </select>
                  </div>

                  {/* Prioridade */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Prioridade
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'low', label: 'Baixa', icon: '🟢' },
                        { value: 'medium', label: 'Média', icon: '🟡' },
                        { value: 'high', label: 'Alta', icon: '🟠' },
                        { value: 'urgent', label: 'Urgente', icon: '🔴' }
                      ].map((priority) => (
                        <label
                          key={priority.value}
                          className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            watchedValues.priority === priority.value 
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
                          <span className="mr-2">{priority.icon}</span>
                          <span className="text-sm font-medium">{priority.label}</span>
                          {watchedValues.priority === priority.value && (
                            <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Participantes */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    Participantes
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'todos', label: 'Todos', icon: '👥' },
                      { value: 'administradores', label: 'Administradores', icon: '👑' },
                      { value: 'gerentes', label: 'Gerentes', icon: '👔' },
                      { value: 'funcionarios', label: 'Funcionários', icon: '👤' },
                      { value: 'terceirizados', label: 'Terceirizados', icon: '🤝' },
                      { value: 'clientes', label: 'Clientes', icon: '🎯' }
                    ].map((attendee) => (
                      <label key={attendee.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={attendee.value}
                          {...register('attendees')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <span className="mr-2">{attendee.icon}</span>
                        <span className="text-sm font-medium">{attendee.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lembretes */}
                <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                      <Bell className="h-4 w-4 mr-2 text-yellow-600" />
                      Lembretes
                    </h3>
                    <button
                      type="button"
                      onClick={addReminder}
                      className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </button>
                  </div>

                  {reminders.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-4">
                      Nenhum lembrete configurado. Clique em "Adicionar" para criar um.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reminders.map((reminder, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white border border-yellow-200 rounded-lg">
                          <select
                            value={reminder.type}
                            onChange={(e) => updateReminder(index, 'type', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="email">📧 Email</option>
                            <option value="push">📱 Push</option>
                            <option value="popup">💬 Popup</option>
                          </select>

                          <select
                            value={reminder.minutesBefore}
                            onChange={(e) => updateReminder(index, 'minutesBefore', parseInt(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={5}>5 minutos antes</option>
                            <option value={15}>15 minutos antes</option>
                            <option value={30}>30 minutos antes</option>
                            <option value={60}>1 hora antes</option>
                            <option value={1440}>1 dia antes</option>
                          </select>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={reminder.isActive}
                              onChange={(e) => updateReminder(index, 'isActive', e.target.checked)}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm">Ativo</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeReminder(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
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
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Opções especiais */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Opções Especiais
                  </h3>
                  
                  <label className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isPublic')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                    />
                    <Eye className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Evento público</span>
                      <p className="text-xs text-gray-600">Visível para todos os usuários da plataforma</p>
                    </div>
                  </label>
                </div>
              </form>
            ) : (
              /* Preview */
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Evento
                      </span>
                      {watchedValues.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(watchedValues.priority)}`}>
                          {watchedValues.priority === 'urgent' && '🔴 Urgente'}
                          {watchedValues.priority === 'high' && '🟠 Alta'}
                          {watchedValues.priority === 'medium' && '🟡 Média'}
                          {watchedValues.priority === 'low' && '🟢 Baixa'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {watchedValues.startDate && new Date(watchedValues.startDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {watchedValues.title || 'Título do evento aparecerá aqui'}
                  </h3>
                  
                  <div className="text-gray-600 mb-3">
                    {watchedValues.description || 'A descrição do evento aparecerá aqui...'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    {watchedValues.startDate && watchedValues.endDate && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {watchIsAllDay ? (
                          <span>
                            {new Date(watchedValues.startDate).toLocaleDateString('pt-BR')} - {new Date(watchedValues.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span>
                            {new Date(watchedValues.startDate).toLocaleString('pt-BR')} - {new Date(watchedValues.endDate).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {watchedValues.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {watchedValues.location}
                      </div>
                    )}
                    
                    {watchedValues.meetingLink && (
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        <a href={watchedValues.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Link da reunião
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {selectedTags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-center text-gray-500 text-sm">
                  📅 Esta é uma prévia de como o evento aparecerá no calendário
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {!showPreview && (
                <span>💡 Use a aba "Visualizar" para ver como ficará o evento</span>
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

              <button
                type="submit"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting || !isValid || showPreview}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Atualizar' : 'Criar'} Evento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedEventForm;