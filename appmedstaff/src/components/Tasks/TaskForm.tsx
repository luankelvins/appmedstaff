import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, CreateTaskRequest, UpdateTaskRequest, RecurrenceRule } from '../../types/task';
import { Project } from '../../types/project';
import { X, Calendar, Clock, Tag, FolderOpen } from 'lucide-react';
import UserSelector from './UserSelector';
import RecurrenceConfig from './RecurrenceConfig';
import projectService from '../../services/projectService';

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
  }, [task, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.estimatedHours && isNaN(Number(formData.estimatedHours))) {
      newErrors.estimatedHours = 'Horas estimadas deve ser um número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Editar tarefa' : 'Nova tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o título da task"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva a task em detalhes"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={TaskPriority.LOW}>Baixa</option>
              <option value={TaskPriority.MEDIUM}>Média</option>
              <option value={TaskPriority.HIGH}>Alta</option>
              <option value={TaskPriority.URGENT}>Urgente</option>
            </select>
          </div>

          {/* Assignee and Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserSelector
              label="Responsável"
              selectedUsers={formData.assignedTo}
              onSelectionChange={(userIds) => setFormData(prev => ({ ...prev, assignedTo: userIds }))}
              multiple={false}
              placeholder="Selecione um responsável"
            />

            <UserSelector
              label="Participantes"
              selectedUsers={formData.participants}
              onSelectionChange={(userIds) => setFormData(prev => ({ ...prev, participants: userIds }))}
              multiple={true}
              placeholder="Selecione participantes"
            />
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horas Estimadas
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: 8"
              />
              {errors.estimatedHours && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
              )}
            </div>
          </div>

          {/* Category and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Desenvolvimento, Design"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          {/* Recorrência */}
          <div>
            <RecurrenceConfig
              recurrenceRule={recurrenceRule}
              onChange={setRecurrenceRule}
              isEnabled={isRecurring}
              onToggle={setIsRecurring}
            />
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : task ? 'Atualizar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;