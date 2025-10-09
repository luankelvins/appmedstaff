import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskStatus, KanbanColumn, CreateTaskRequest, UpdateTaskRequest } from '../../types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import taskService from '../../utils/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, RefreshCw, AlertCircle, MoreVertical } from 'lucide-react';

interface TaskKanbanViewProps {
  onTaskClick?: (task: Task) => void;
  onCommentsClick?: (taskId: string) => void;
}

const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({ onTaskClick, onCommentsClick }) => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [formLoading, setFormLoading] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | undefined>();

  // Column definitions
  const columnDefinitions = [
    {
      id: TaskStatus.TODO,
      title: 'A Fazer',
      color: 'bg-gray-50 border-gray-200',
      headerColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: 'Em Andamento',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: TaskStatus.IN_REVIEW,
      title: 'Em Revisão',
      color: 'bg-purple-50 border-purple-200',
      headerColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: TaskStatus.DONE,
      title: 'Concluído',
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-100 text-green-800'
    }
  ];

  // Load tasks and organize into columns
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.getTasks({}, { field: 'updated_at', direction: 'desc' }, 1, 100);
      
      const newColumns: KanbanColumn[] = columnDefinitions.map(colDef => ({
        id: colDef.id,
        title: colDef.title,
        color: colDef.color,
        tasks: response.tasks.filter(task => task.status === colDef.id)
      }));

      setColumns(newColumns);
    } catch (err) {
      setError('Erro ao carregar tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Drag and drop handler
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColumnIndex = columns.findIndex(col => col.id === destination.droppableId);
    
    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    const sourceColumn = columns[sourceColumnIndex];
    const destColumn = columns[destColumnIndex];
    const task = sourceColumn.tasks.find(t => t.id === draggableId);
    
    if (!task) return;

    // Create new columns array
    const newColumns = [...columns];
    
    // Remove task from source column
    newColumns[sourceColumnIndex] = {
      ...sourceColumn,
      tasks: sourceColumn.tasks.filter(t => t.id !== draggableId)
    };

    // Add task to destination column
    const updatedTask = { ...task, status: destination.droppableId as TaskStatus };
    const destTasks = [...destColumn.tasks];
    destTasks.splice(destination.index, 0, updatedTask);
    
    newColumns[destColumnIndex] = {
      ...destColumn,
      tasks: destTasks
    };

    // Update state optimistically
    setColumns(newColumns);

    // Update task status on server
    try {
      await taskService.updateTaskStatus(draggableId, destination.droppableId as TaskStatus);
    } catch (err) {
      // Revert on error
      setColumns(columns);
      setError('Erro ao atualizar status da task');
      console.error('Error updating task status:', err);
    }
  };

  // Handlers
  const handleCreateTask = (status?: TaskStatus) => {
    setEditingTask(undefined);
    setNewTaskStatus(status);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskStatus(undefined);
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

  const handleFormSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      setFormLoading(true);
      
      if (editingTask) {
        await taskService.updateTask(editingTask.id, data as UpdateTaskRequest);
      } else {
        const createData = data as CreateTaskRequest;
        if (newTaskStatus) {
          // This will be handled by the service to set initial status
        }
        await taskService.createTask(createData, user?.id || ''); // Usar ID do usuário atual
      }
      
      setIsFormOpen(false);
      setEditingTask(undefined);
      setNewTaskStatus(undefined);
      loadTasks();
    } catch (err) {
      setError(editingTask ? 'Erro ao atualizar task' : 'Erro ao criar tarefa');
      console.error('Error submitting task:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      handleEditTask(task);
    }
  };

  const getColumnDefinition = (status: TaskStatus) => {
    return columnDefinitions.find(col => col.id === status);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban</h1>
          <p className="text-gray-600">
            Gerencie suas tasks visualmente
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTasks}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
          
          <button
            onClick={() => handleCreateTask()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && (
        <div className="flex-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-h-[600px]">
              {columns.map((column) => {
                const colDef = getColumnDefinition(column.id);
                return (
                  <div key={column.id} className="flex-shrink-0 w-80">
                    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
                      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: colDef?.color || '#6B7280' }}
                            />
                            <h3 className="font-medium text-gray-900">{column.title}</h3>
                          </div>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                            {column.tasks.length}
                          </span>
                        </div>
                        
                        {/* Estatísticas da coluna */}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Alta: {column.tasks.filter(t => t.priority === 'high').length}
                          </span>
                          <span>
                            Média: {column.tasks.filter(t => t.priority === 'medium').length}
                          </span>
                          <span>
                            Baixa: {column.tasks.filter(t => t.priority === 'low').length}
                          </span>
                        </div>
                      </div>

                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 p-4 space-y-3 min-h-[400px] ${
                              snapshot.isDraggingOver ? 'bg-blue-50' : ''
                            }`}
                            style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
                          >
                            {column.tasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`${
                                      snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                                    }`}
                                  >
                                    <TaskCard
                                      task={task}
                                      onClick={() => handleTaskClick(task)}
                                      onEdit={() => handleEditTask(task)}
                                      onDelete={() => handleDeleteTask(task.id)}
                                      onComments={() => onCommentsClick?.(task.id)}
                                      showActions={true}
                                      compact={true}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            
                            {provided.placeholder}
                            
                            {/* Empty State */}
                            {column.tasks.length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                                  <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                  </svg>
                                </div>
                                <p className="text-sm">Nenhuma task</p>
                                <button
                                  onClick={() => handleCreateTask(column.id)}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Adicionar task
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
          setNewTaskStatus(undefined);
        }}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />
    </div>
  );
};

export default TaskKanbanView;