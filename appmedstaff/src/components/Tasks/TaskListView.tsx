import React, { useState, useEffect } from 'react';
import { Task, TaskFilter, TaskSort, TaskListResponse, CreateTaskRequest, UpdateTaskRequest } from '../../types/task';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import TaskDashboard from './TaskDashboard';
import taskService from '../../services/taskService';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

interface TaskListViewProps {
  onTaskClick?: (task: Task) => void;
  onCommentsClick?: (taskId: string) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ onTaskClick, onCommentsClick }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'updatedAt', direction: 'desc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  // Load tasks
  const loadTasks = async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 1 : pagination.page;
      const response: TaskListResponse = await taskService.getTasks(
        filter,
        sort,
        currentPage,
        pagination.limit
      );

      setTasks(response.tasks);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError('Erro ao carregar tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadTasks(true);
  }, [filter, sort]);

  useEffect(() => {
    if (pagination.page > 1) {
      loadTasks();
    }
  }, [pagination.page]);

  // Handlers
  const handleFilterChange = (newFilter: TaskFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: TaskSort) => {
    setSort(newSort);
  };

  const handleClearFilters = () => {
    setFilter({});
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta task?')) return;

    try {
      await taskService.deleteTask(taskId);
      loadTasks();
    } catch (err) {
      setError('Erro ao excluir task');
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (taskId: string, status: any) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      loadTasks();
    } catch (err) {
      setError('Erro ao atualizar status da task');
      console.error('Error updating task status:', err);
    }
  };

  const handleFormSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      setFormLoading(true);
      
      if (editingTask) {
        await taskService.updateTask(editingTask.id, data as UpdateTaskRequest);
      } else {
        await taskService.createTask(data as CreateTaskRequest, 'current-user'); // TODO: Get from auth context
      }
      
      setIsFormOpen(false);
      setEditingTask(undefined);
      loadTasks();
    } catch (err) {
      setError(editingTask ? 'Erro ao atualizar tarefa' : 'Erro ao criar tarefa');
      console.error('Error submitting task:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      handleEditTask(task);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">
            {pagination.total} task{pagination.total !== 1 ? 's' : ''} encontrada{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadTasks(true)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
          
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <TaskDashboard tasks={tasks} />

      {/* Filters */}
      <TaskFilters
        filter={filter}
        sort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && tasks.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma task encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {Object.keys(filter).length > 0 
              ? 'Tente ajustar os filtros ou criar uma nova tarefa.'
              : 'Comece criando sua primeira task.'
            }
          </p>
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Tarefa</span>
          </button>
        </div>
      )}

      {/* Task List */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onEdit={() => handleEditTask(task)}
              onDelete={() => handleDeleteTask(task.id)}
              onStatusChange={(status) => handleStatusChange(task.id, status)}
              onComments={() => onCommentsClick?.(task.id)}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.page < pagination.totalPages && (
        <div className="text-center py-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Carregar Mais'}
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination.totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          Página {pagination.page} de {pagination.totalPages} • {pagination.total} tasks no total
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />
    </div>
  );
};

export default TaskListView;