import React, { useState } from 'react';
import { Task, RecurrenceEditMode, UpdateTaskRequest, UpdateRecurrenceSeriesRequest } from '../../types/task';
import { X, Calendar, Repeat, AlertTriangle } from 'lucide-react';

interface RecurringTaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEditTask: (taskId: string, updates: UpdateTaskRequest, editMode: RecurrenceEditMode) => Promise<void>;
  onEditSeries: (seriesId: string, updates: UpdateRecurrenceSeriesRequest) => Promise<void>;
}

const RecurringTaskEditModal: React.FC<RecurringTaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onEditTask,
  onEditSeries
}) => {
  const [selectedMode, setSelectedMode] = useState<RecurrenceEditMode>(RecurrenceEditMode.THIS_TASK);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !task.recurrenceId) return null;

  const editModeOptions = [
    {
      value: RecurrenceEditMode.THIS_TASK,
      title: 'Apenas esta tarefa',
      description: 'Editar somente esta ocorrência específica',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      value: RecurrenceEditMode.THIS_AND_FUTURE,
      title: 'Esta e futuras tarefas',
      description: 'Editar esta tarefa e todas as futuras',
      icon: Repeat,
      color: 'text-orange-600'
    },
    {
      value: RecurrenceEditMode.ALL_TASKS,
      title: 'Toda a recorrência',
      description: 'Editar todas as tarefas (passadas e futuras)',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const handleConfirm = async () => {
    if (!task.recurrenceId) return;

    setIsLoading(true);
    try {
      if (selectedMode === RecurrenceEditMode.THIS_TASK) {
        // Editar apenas esta tarefa
        await onEditTask(task.id, {
          title: task.title,
          description: task.description,
          priority: task.priority,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          tags: task.tags,
          category: task.category,
          project: task.project,
          estimatedHours: task.estimatedHours
        }, selectedMode);
      } else {
        // Editar série ou esta e futuras
        await onEditSeries(task.recurrenceId, {
          templateTask: {
            title: task.title,
            description: task.description,
            priority: task.priority,
            assignedTo: task.assignedTo,
            tags: task.tags,
            category: task.category,
            project: task.project,
            estimatedHours: task.estimatedHours
          },
          editMode: selectedMode,
          taskId: selectedMode === RecurrenceEditMode.THIS_AND_FUTURE ? task.id : undefined
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao editar tarefa recorrente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Editar Tarefa Recorrente</h3>
            <p className="text-sm text-gray-600 mt-1">Como você deseja editar esta tarefa?</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {editModeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMode === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="editMode"
                    value={option.value}
                    checked={selectedMode === option.value}
                    onChange={(e) => setSelectedMode(e.target.value as RecurrenceEditMode)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${option.color}`} />
                      <span className="font-medium text-gray-900">{option.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Warning for destructive actions */}
          {(selectedMode === RecurrenceEditMode.ALL_TASKS || selectedMode === RecurrenceEditMode.THIS_AND_FUTURE) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Atenção!</p>
                  <p>
                    {selectedMode === RecurrenceEditMode.ALL_TASKS
                      ? 'Esta ação irá modificar todas as tarefas, incluindo as já concluídas.'
                      : 'Esta ação irá modificar esta tarefa e todas as futuras.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringTaskEditModal;