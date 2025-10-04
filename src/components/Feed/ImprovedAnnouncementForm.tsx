import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Calendar, Users, Tag, AlertTriangle, CheckCircle, Info, 
  Megaphone, Eye, EyeOff, Save, Send, Bell, Clock, Target, Paperclip
} from 'lucide-react';
import { AnnouncementFormData, Priority, AnnouncementCategory } from '../../types/feed';
import FileUpload from '../UI/FileUpload';

interface ImprovedAnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  initialData?: Partial<AnnouncementFormData>;
  isEditing?: boolean;
}

const ImprovedAnnouncementForm: React.FC<ImprovedAnnouncementFormProps> = ({
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch,
    setValue
  } = useForm<AnnouncementFormData>({
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      category: initialData?.category || 'general',
      expiresAt: initialData?.expiresAt,
      isUrgent: initialData?.isUrgent || false,
      acknowledgmentRequired: initialData?.acknowledgmentRequired || false,
      isPublic: initialData?.isPublic ?? true,
      targetAudience: initialData?.targetAudience || [],
      tags: initialData?.tags || []
    }
  });

  const watchedValues = watch();
  const watchPriority = watch('priority');
  const watchIsUrgent = watch('isUrgent');
  const watchCategory = watch('category');

  // Validação em tempo real
  useEffect(() => {
    const validateField = (fieldName: string, value: any) => {
      const newErrors = { ...validationErrors };
      
      switch (fieldName) {
        case 'title':
          if (!value || value.trim().length < 5) {
            newErrors.title = 'Título deve ter pelo menos 5 caracteres';
          } else if (value.length > 150) {
            newErrors.title = 'Título não pode exceder 150 caracteres';
          } else {
            delete newErrors.title;
          }
          break;
        case 'description':
          if (!value || value.trim().length < 20) {
            newErrors.description = 'Conteúdo deve ter pelo menos 20 caracteres';
          } else if (value.length > 2000) {
            newErrors.description = 'Conteúdo não pode exceder 2000 caracteres';
          } else {
            delete newErrors.description;
          }
          break;
        case 'expiresAt':
          if (value && new Date(value) <= new Date()) {
            newErrors.expiresAt = 'Data de expiração deve ser futura';
          } else {
            delete newErrors.expiresAt;
          }
          break;
      }
      
      setValidationErrors(newErrors);
    };

    Object.entries(watchedValues).forEach(([key, value]) => {
      if (touchedFields[key as keyof AnnouncementFormData]) {
        validateField(key, value);
      }
    });
  }, [watchedValues, touchedFields]);

  const handleFormSubmit = async (data: AnnouncementFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags: selectedTags,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        attachments: attachedFiles,
        existingAttachments: initialData?.existingAttachments || []
      });
      reset();
      setSelectedTags([]);
      setAttachedFiles([]);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Megaphone className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h2>
                <p className="text-purple-100 text-sm">
                  Compartilhe informações importantes com sua equipe
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
                    <Megaphone className="h-4 w-4 mr-2 text-purple-600" />
                    Título do Comunicado
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('title', { 
                        required: 'Título é obrigatório',
                        minLength: { value: 5, message: 'Título deve ter pelo menos 5 caracteres' },
                        maxLength: { value: 150, message: 'Título não pode exceder 150 caracteres' }
                      })}
                      className={getInputClasses('title')}
                      placeholder="Ex: Nova política de trabalho remoto"
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
                      {watchedValues.title?.length || 0}/150
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    Conteúdo
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description', { 
                        required: 'Conteúdo é obrigatório',
                        minLength: { value: 20, message: 'Conteúdo deve ter pelo menos 20 caracteres' },
                        maxLength: { value: 2000, message: 'Conteúdo não pode exceder 2000 caracteres' }
                      })}
                      rows={8}
                      className={getInputClasses('description')}
                      placeholder="Digite o conteúdo do comunicado. Use quebras de linha para organizar melhor o texto..."
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">
                      {errors.description?.message || validationErrors.description}
                    </span>
                    <span className="text-gray-500">
                      {watchedValues.description?.length || 0}/2000
                    </span>
                  </div>
                </div>

                {/* Configurações principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categoria */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Tag className="h-4 w-4 mr-2 text-purple-600" />
                      Categoria
                    </label>
                    <select
                      {...register('category')}
                      className={getInputClasses('category')}
                    >
                      <option value="general">📢 Geral</option>
                      <option value="policy">📋 Política</option>
                      <option value="system">⚙️ Sistema</option>
                      <option value="event">🎉 Evento</option>
                      <option value="urgent">🚨 Urgente</option>
                      <option value="maintenance">🔧 Manutenção</option>
                    </select>
                  </div>

                  {/* Data de expiração */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Clock className="h-4 w-4 mr-2 text-purple-600" />
                      Data de Expiração
                    </label>
                    <input
                      type="datetime-local"
                      {...register('expiresAt')}
                      className={getInputClasses('expiresAt')}
                    />
                    {validationErrors.expiresAt && (
                      <p className="text-xs text-red-600">{validationErrors.expiresAt}</p>
                    )}
                  </div>
                </div>

                {/* Prioridade */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    Prioridade
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'low', label: 'Baixa', icon: '🟢', desc: 'Informativo' },
                      { value: 'medium', label: 'Média', icon: '🟡', desc: 'Importante' },
                      { value: 'high', label: 'Alta', icon: '🟠', desc: 'Prioritário' },
                      { value: 'urgent', label: 'Urgente', icon: '🔴', desc: 'Crítico' }
                    ].map((priority) => (
                      <label
                        key={priority.value}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
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
                        <span className="text-2xl mb-1">{priority.icon}</span>
                        <span className="text-sm font-medium">{priority.label}</span>
                        <span className="text-xs opacity-75">{priority.desc}</span>
                        {watchPriority === priority.value && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Público-alvo */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Target className="h-4 w-4 mr-2 text-purple-600" />
                    Público-alvo
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'todos', label: 'Todos', icon: '👥' },
                      { value: 'administradores', label: 'Administradores', icon: '👑' },
                      { value: 'gerentes', label: 'Gerentes', icon: '👔' },
                      { value: 'funcionarios', label: 'Funcionários', icon: '👤' },
                      { value: 'terceirizados', label: 'Terceirizados', icon: '🤝' },
                      { value: 'clientes', label: 'Clientes', icon: '🎯' }
                    ].map((audience) => (
                      <label key={audience.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={audience.value}
                          {...register('targetAudience')}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                        />
                        <span className="mr-2">{audience.icon}</span>
                        <span className="text-sm font-medium">{audience.label}</span>
                      </label>
                    ))}
                  </div>
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
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-purple-600"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Digite uma tag e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Anexos */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Paperclip className="h-4 w-4 mr-2 text-purple-600" />
                    Anexos
                  </label>
                  <FileUpload
                    files={attachedFiles}
                    onFilesChange={setAttachedFiles}
                    maxFiles={5}
                    maxFileSize={10 * 1024 * 1024} // 10MB
                    acceptedTypes={[
                      'image/jpeg',
                      'image/png',
                      'image/gif',
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'text/plain'
                    ]}
                  />
                  <p className="text-xs text-gray-500">
                    Máximo 5 arquivos, até 10MB cada. Formatos aceitos: imagens, PDF, Word, Excel, texto.
                  </p>
                </div>

                {/* Opções especiais */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Opções Especiais
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('isUrgent')}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-3"
                      />
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Comunicado urgente</span>
                        <p className="text-xs text-gray-600">Será destacado no feed e enviará notificação imediata</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('acknowledgmentRequired')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Requer confirmação de leitura</span>
                        <p className="text-xs text-gray-600">Usuários precisarão confirmar que leram o comunicado</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('isPublic')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                      />
                      <Eye className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Comunicado público</span>
                        <p className="text-xs text-gray-600">Visível para todos os usuários da plataforma</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Aviso para comunicados urgentes */}
                {(watchIsUrgent || watchPriority === 'urgent') && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          ⚠️ Comunicado Urgente
                        </h3>
                        <p className="mt-1 text-sm text-red-700">
                          Este comunicado será destacado no feed e todos os usuários selecionados receberão uma notificação imediata. 
                          Use apenas para informações realmente críticas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* Preview */
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Comunicado
                      </span>
                      {watchPriority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(watchPriority)}`}>
                          {watchPriority === 'urgent' && '🔴 Urgente'}
                          {watchPriority === 'high' && '🟠 Alta'}
                          {watchPriority === 'medium' && '🟡 Média'}
                          {watchPriority === 'low' && '🟢 Baixa'}
                        </span>
                      )}
                      {watchIsUrgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          ⚠️ URGENTE
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">Agora mesmo</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {watchedValues.title || 'Título do comunicado aparecerá aqui'}
                  </h3>
                  
                  <div className="text-gray-600 whitespace-pre-wrap">
                    {watchedValues.description || 'O conteúdo do comunicado aparecerá aqui...'}
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
                  
                  {attachedFiles.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Paperclip className="h-4 w-4 mr-1" />
                        Arquivos anexados ({attachedFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📎</span>
                            <span className="flex-1">{file.name}</span>
                            <span className="text-xs text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-gray-500 text-sm">
                  👆 Esta é uma prévia de como o comunicado aparecerá no feed
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
                <span>💡 Use a aba "Visualizar" para ver como ficará o comunicado</span>
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
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isEditing ? 'Atualizar' : 'Publicar'} Comunicado
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

export default ImprovedAnnouncementForm;