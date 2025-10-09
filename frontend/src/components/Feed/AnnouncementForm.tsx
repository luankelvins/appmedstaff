import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertTriangle, Calendar, Users, Tag } from 'lucide-react';
import { AnnouncementFormData, Priority, AnnouncementCategory } from '../../types/feed';

interface AnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  initialData?: Partial<AnnouncementFormData>;
  isEditing?: boolean;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<AnnouncementFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      category: initialData?.category || 'general',
      expiresAt: initialData?.expiresAt,
      isUrgent: initialData?.isUrgent || false,
      acknowledgmentRequired: initialData?.acknowledgmentRequired || false,
      tags: initialData?.tags || [],
      isPublic: initialData?.isPublic ?? true,
      targetAudience: initialData?.targetAudience || []
    }
  });

  const watchIsUrgent = watch('isUrgent');
  const watchPriority = watch('priority');

  const handleFormSubmit = async (data: AnnouncementFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags: selectedTags,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      });
      reset();
      setSelectedTags([]);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar comunicado:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}
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
              placeholder="Digite o título do comunicado"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              {...register('description', { required: 'Conteúdo é obrigatório' })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o conteúdo completo do comunicado"
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
                <Tag className="inline h-4 w-4 mr-1" />
                Categoria
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">Geral</option>
                <option value="policy">Política</option>
                <option value="procedure">Procedimento</option>
                <option value="safety">Segurança</option>
                <option value="hr">Recursos Humanos</option>
                <option value="it">Tecnologia</option>
                <option value="finance">Financeiro</option>
                <option value="emergency">Emergência</option>
              </select>
            </div>
          </div>

          {/* Data de Expiração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data de Expiração
            </label>
            <input
              type="datetime-local"
              {...register('expiresAt')}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Deixe em branco se o comunicado não expira
            </p>
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

          {/* Público-alvo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Público-alvo
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {['Todos', 'Administradores', 'Gerentes', 'Funcionários', 'Terceirizados'].map((audience) => (
                  <label key={audience} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={audience.toLowerCase()}
                      {...register('targetAudience')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{audience}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-yellow-50 rounded-md">
              <input
                type="checkbox"
                {...register('isUrgent')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <AlertTriangle className="h-4 w-4 text-yellow-600 ml-2 mr-1" />
              <label className="text-sm text-gray-700">
                Comunicado urgente (será destacado no feed)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('acknowledgmentRequired')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Requer confirmação de leitura
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Comunicado público (visível para todos)
              </label>
            </div>
          </div>

          {/* Aviso para comunicados urgentes */}
          {(watchIsUrgent || watchPriority === 'urgent') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Comunicado Urgente
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Este comunicado será destacado no feed e todos os usuários receberão uma notificação imediata.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                watchIsUrgent || watchPriority === 'urgent'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Publicar Comunicado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;