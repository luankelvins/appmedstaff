import { TaskStatus, TaskPriority } from '../types/task';

export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return 'A Fazer';
    case TaskStatus.IN_PROGRESS:
      return 'Em Andamento';
    case TaskStatus.IN_REVIEW:
      return 'Em Revisão';
    case TaskStatus.DONE:
      return 'Concluído';
    case TaskStatus.CANCELLED:
      return 'Cancelado';
    default:
      return status;
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'Baixa';
    case TaskPriority.MEDIUM:
      return 'Média';
    case TaskPriority.HIGH:
      return 'Alta';
    case TaskPriority.URGENT:
      return 'Urgente';
    default:
      return priority;
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return 'bg-gray-100 text-gray-800';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case TaskStatus.IN_REVIEW:
      return 'bg-yellow-100 text-yellow-800';
    case TaskStatus.DONE:
      return 'bg-green-100 text-green-800';
    case TaskStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'border-green-300 text-green-700 bg-green-50';
    case TaskPriority.MEDIUM:
      return 'border-yellow-300 text-yellow-700 bg-yellow-50';
    case TaskPriority.HIGH:
      return 'border-orange-300 text-orange-700 bg-orange-50';
    case TaskPriority.URGENT:
      return 'border-red-300 text-red-700 bg-red-50';
    default:
      return 'border-gray-300 text-gray-700 bg-gray-50';
  }
};