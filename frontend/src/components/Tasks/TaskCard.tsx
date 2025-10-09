import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { Calendar, Clock, User, MessageCircle, Paperclip, Play, Pause, Square, Repeat } from 'lucide-react';
import { getStatusLabel, getPriorityLabel, getStatusColor, getPriorityColor } from '../../utils/taskLabels';
import RecurringTaskEditModal from './RecurringTaskEditModal';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onComments?: () => void;
  onTimerStart?: () => void;
  onTimerPause?: () => void;
  onTimerStop?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  onEdit,
  onDelete,
  onComments,
  onTimerStart,
  onTimerPause,
  onTimerStop,
  showActions = true,
  compact = false
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // Atualizar o tempo atual quando o timer estiver rodando
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (task.isTimerRunning && task.timerStartedAt) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(task.timerStartedAt!).getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const total = (task.totalTimeSpent || 0) + elapsed;
        setCurrentTime(total);
      }, 1000);
    } else {
      setCurrentTime(task.totalTimeSpent || 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.isTimerRunning, task.timerStartedAt, task.totalTimeSpent]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <>
      <div
        className={`
          bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow
          ${onClick ? 'cursor-pointer' : ''}
          ${compact ? 'p-3' : 'p-4'}
          ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
        `}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {task.title}
            </h3>
            {task.description && !compact && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (task.isRecurring || task.recurrenceId) {
                    setShowRecurringModal(true);
                  } else {
                    onEdit?.();
                  }
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Status and Priority */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          {(task.isRecurring || task.recurrenceId) && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 border border-purple-200">
              <Repeat className="w-3 h-3 inline mr-1" />
              Recorrente
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, compact ? 2 : 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > (compact ? 2 : 4) && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                +{task.tags.length - (compact ? 2 : 4)}
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className={`flex items-center justify-between text-xs text-gray-500 ${compact ? 'space-x-2' : 'space-x-4'}`}>
          <div className="flex items-center space-x-3">
            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{task.assignedTo}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            
            {task.estimatedHours && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}

            {/* Temporizador */}
            {(task.isTimerRunning || currentTime > 0) && (
              <div className={`flex items-center space-x-1 ${task.isTimerRunning ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                <Clock className={`w-3 h-3 ${task.isTimerRunning ? 'animate-pulse' : ''}`} />
                <span>{formatTime(currentTime)}</span>
                {task.isTimerRunning && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {(task.comments.length > 0 || onComments) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComments?.();
                }}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                title="Ver comentários"
              >
                <MessageCircle className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </button>
            )}
            
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timer and Status Controls */}
        {!compact && (onStatusChange || onTimerStart || onTimerPause || onTimerStop) && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {/* Timer Controls */}
            {(onTimerStart || onTimerPause || onTimerStop) && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium">Timer:</span>
                {!task.isTimerRunning ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimerStart?.();
                    }}
                    className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    title="Iniciar temporizador"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimerPause?.();
                      }}
                      className="flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                      title="Pausar temporizador"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pausar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimerStop?.();
                      }}
                      className="flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Parar temporizador"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Parar
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Status Change Buttons */}
            {onStatusChange && (
              <div className="flex space-x-2">
                {task.status !== TaskStatus.IN_PROGRESS && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(TaskStatus.IN_PROGRESS);
                    }}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Iniciar Tarefa
                  </button>
                )}
                {task.status !== TaskStatus.DONE && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(TaskStatus.DONE);
                    }}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Concluir
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recurring Task Edit Modal */}
      {showRecurringModal && (
        <RecurringTaskEditModal
          task={task}
          isOpen={showRecurringModal}
          onClose={() => setShowRecurringModal(false)}
          onEditTask={async (taskId, updates, editMode) => {
            // Implementar lógica de edição de tarefa
            console.log('Edit task:', taskId, updates, editMode);
            onEdit?.();
            setShowRecurringModal(false);
          }}
          onEditSeries={async (seriesId, updates) => {
            // Implementar lógica de edição de série
            console.log('Edit series:', seriesId, updates);
            setShowRecurringModal(false);
          }}
        />
      )}
    </>
  );
};

export default TaskCard;