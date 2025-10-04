import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, MapPin, Users, Clock, Link, Bell, Repeat } from 'lucide-react';
import { EventFormData, Priority, EventCategory, RecurrenceConfig } from '../../types/feed';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: Partial<EventFormData>;
  isEditing?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(initialData?.attendees || []);
  const [reminders, setReminders] = useState(initialData?.reminders || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<EventFormData>({
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
      tags: initialData?.tags || [],
      isPublic: initialData?.isPublic ?? true,
      attendees: initialData?.attendees || [],
      reminders: initialData?.reminders || []
    }
  });

  const watchStartDate = watch('startDate');
  const watchIsAllDay = watch('isAllDay');

  const handleFormSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags: selectedTags,
        attendees: selectedAttendees,
        reminders,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      });
      reset();
      setSelectedTags([]);
      setSelectedAttendees([]);
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
      type: 'push',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Título é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do evento"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              {...register('description', { required: 'Descrição é obrigatória' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o evento em detalhes"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Linha 1: Prioridade e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="meeting">Reunião</option>
                <option value="conference">Conferência</option>
                <option value="training">Treinamento</option>
                <option value="workshop">Workshop</option>
                <option value="social">Social</option>
                <option value="deadline">Prazo</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          {/* Evento de dia inteiro */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isAllDay')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Evento de dia inteiro
            </label>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {watchIsAllDay ? 'Data de Início *' : 'Data/Hora de Início *'}
              </label>
              <input
                type={watchIsAllDay ? 'date' : 'datetime-local'}
                {...register('startDate', { required: 'Data de início é obrigatória' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                {watchIsAllDay ? 'Data de Término *' : 'Data/Hora de Término *'}
              </label>
              <input
                type={watchIsAllDay ? 'date' : 'datetime-local'}
                {...register('endDate', { required: 'Data de término é obrigatória' })}
                min={watchStartDate ? new Date(watchStartDate).toISOString().slice(0, watchIsAllDay ? 10 : 16) : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Local e Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Local
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Local do evento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="inline h-4 w-4 mr-1" />
                Link da Reunião
              </label>
              <input
                type="url"
                {...register('meetingLink')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
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
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lembretes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Bell className="inline h-4 w-4 mr-1" />
                Lembretes
              </label>
              <button
                type="button"
                onClick={addReminder}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Adicionar Lembrete
              </button>
            </div>
            
            <div className="space-y-3">
              {reminders.map((reminder, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <select
                    value={reminder.type}
                    onChange={(e) => updateReminder(index, 'type', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="push">Push</option>
                    <option value="email">Email</option>
                    <option value="popup">Popup</option>
                  </select>
                  
                  <input
                    type="number"
                    value={reminder.minutesBefore}
                    onChange={(e) => updateReminder(index, 'minutesBefore', parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="1"
                  />
                  <span className="text-sm text-gray-600">minutos antes</span>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reminder.isActive}
                      onChange={(e) => updateReminder(index, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-1 text-sm text-gray-600">Ativo</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => removeReminder(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Evento público (visível para todos)
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;