import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Task } from '../../types/task';
import TaskListView from './TaskListView';
import TaskKanbanView from './TaskKanbanView';
import TaskCalendarView from './TaskCalendarView';
import TaskComments from './TaskComments';
import { List, Kanban, Calendar, LayoutGrid } from 'lucide-react';

type ViewMode = 'list' | 'kanban' | 'calendar';

const TasksPageWrapper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determinar o viewMode baseado na URL
  const getViewModeFromPath = (pathname: string): ViewMode => {
    if (pathname.includes('/tasks/kanban')) return 'kanban';
    if (pathname.includes('/tasks/calendar')) return 'calendar';
    return 'list'; // default para /tasks e /tasks/list
  };

  const [viewMode, setViewMode] = useState<ViewMode>(getViewModeFromPath(location.pathname));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentsTaskId, setCommentsTaskId] = useState<string>('');

  // Atualizar viewMode quando a URL mudar
  useEffect(() => {
    setViewMode(getViewModeFromPath(location.pathname));
  }, [location.pathname]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCommentsClick = (taskId: string) => {
    setCommentsTaskId(taskId);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setCommentsTaskId('');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    const path = mode === 'list' ? '/tasks/list' : `/tasks/${mode}`;
    navigate(path);
  };

  const viewModeButtons = [
    { mode: 'list' as ViewMode, icon: List, label: 'Lista' },
    { mode: 'kanban' as ViewMode, icon: LayoutGrid, label: 'Kanban' },
    { mode: 'calendar' as ViewMode, icon: Calendar, label: 'Calendário' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
            <p className="text-gray-600">Gerencie suas tarefas e projetos</p>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && (
          <TaskListView
            onTaskClick={handleTaskClick}
            onCommentsClick={handleCommentsClick}
          />
        )}
        
        {viewMode === 'kanban' && (
          <TaskKanbanView
            onTaskClick={handleTaskClick}
            onCommentsClick={handleCommentsClick}
          />
        )}
        
        {viewMode === 'calendar' && (
          <TaskCalendarView
            onTaskClick={handleTaskClick}
            onCommentsClick={handleCommentsClick}
          />
        )}
      </div>

      {/* Comments Modal */}
      <TaskComments
        taskId={commentsTaskId}
        isOpen={showComments}
        onClose={handleCloseComments}
      />
    </div>
  );
};

export default TasksPageWrapper;