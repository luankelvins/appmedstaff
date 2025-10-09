import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Task, CalendarEvent, CreateTaskRequest, UpdateTaskRequest, TaskPriority, TaskStatus } from '../../types/task';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import taskService from '../../utils/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, RefreshCw, AlertCircle, Calendar as CalendarIcon, List, Grid } from 'lucide-react';

// Configure moment locale with explicit settings
moment.locale('pt-br', {
  months: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthsShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  weekdays: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  weekdaysMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'],
  week: {
    dow: 0, // Sunday is the first day of the week
    doy: 1  // The week that contains Jan 1st is the first week of the year
  }
});

const localizer = momentLocalizer(moment);

interface TaskCalendarViewProps {
  onTaskClick?: (task: Task) => void;
  onCommentsClick?: (taskId: string) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ onTaskClick, onCommentsClick }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [formLoading, setFormLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.getTasks({}, { field: 'due_date', direction: 'asc' }, 1, 200);
      setTasks(response.tasks);
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

  // Convert tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter(task => {
        // Apply filters
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority && task.dueDate;
      })
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate!),
        end: task.estimatedHours 
          ? new Date(new Date(task.dueDate!).getTime() + task.estimatedHours * 60 * 60 * 1000)
          : new Date(new Date(task.dueDate!).getTime() + 60 * 60 * 1000), // Default 1 hour
        task: task,
        resource: task,
        allDay: false
      }));
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource as Task;
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    // Color by priority
    switch (task.priority) {
      case TaskPriority.HIGH:
        backgroundColor = '#dc2626';
        borderColor = '#dc2626';
        break;
      case TaskPriority.MEDIUM:
        backgroundColor = '#ea580c';
        borderColor = '#ea580c';
        break;
      case TaskPriority.LOW:
        backgroundColor = '#16a34a';
        borderColor = '#16a34a';
        break;
    }

    // Adjust opacity for completed tasks
    if (task.status === TaskStatus.DONE) {
      backgroundColor = backgroundColor + '80'; // Add transparency
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 6px'
      }
    };
  };

  // Handlers
  const handleSelectEvent = (event: CalendarEvent) => {
    const task = event.resource as Task;
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      handleEditTask(task);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setSelectedSlot(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedSlot(null);
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
      
      // If creating from slot selection, set the due date
      if (selectedSlot && !editingTask) {
        (data as CreateTaskRequest).dueDate = selectedSlot.start;
      }
      
      if (editingTask) {
        await taskService.updateTask(editingTask.id, data as UpdateTaskRequest);
      } else {
        await taskService.createTask(data as CreateTaskRequest, user?.id || ''); // Usar ID do usuário atual
      }
      
      setIsFormOpen(false);
      setEditingTask(undefined);
      setSelectedSlot(null);
      loadTasks();
    } catch (err) {
      setError(editingTask ? 'Erro ao atualizar task' : 'Erro ao criar tarefa');
      console.error('Error submitting task:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            Hoje
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onView(Views.MONTH)}
            className={`px-3 py-1 text-sm ${view === Views.MONTH ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(Views.WEEK)}
            className={`px-3 py-1 text-sm ${view === Views.WEEK ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(Views.DAY)}
            className={`px-3 py-1 text-sm ${view === Views.DAY ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">
            Visualize e gerencie prazos das suas tasks
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
            onClick={handleCreateTask}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TaskFilters
          filter={{
            search: searchTerm || undefined,
            status: statusFilter === 'all' ? undefined : [statusFilter],
            priority: priorityFilter === 'all' ? undefined : [priorityFilter]
          }}
          sort={{ field: 'due_date', direction: 'asc' }}
          onFilterChange={(filter) => {
            setSearchTerm(filter.search || '');
            setStatusFilter(filter.status?.[0] || 'all');
            setPriorityFilter(filter.priority?.[0] || 'all');
          }}
          onSortChange={() => {}}
          onClearFilters={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPriorityFilter('all');
          }}
        />
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

      {/* Calendar */}
      {!loading && (
        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: '600px' }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar
            }}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              date: 'Data',
              time: 'Hora',
              event: 'Tarefa',
              allDay: 'Dia inteiro',
              noEventsInRange: 'Não há tarefas neste período',
              showMore: (total) => `+ ${total} mais`,
              work_week: 'Semana de trabalho',
              yesterday: 'Ontem',
              tomorrow: 'Amanhã'
            }}
            formats={{
              monthHeaderFormat: 'MMMM [de] YYYY',
              dayHeaderFormat: 'dddd, DD [de] MMMM',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD [de] MMMM')} - ${moment(end).format('DD [de] MMMM [de] YYYY')}`,
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              selectRangeFormat: ({ start, end }) =>
                `${moment(start).format('DD/MM/YYYY HH:mm')} - ${moment(end).format('DD/MM/YYYY HH:mm')}`,
              agendaHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD [de] MMMM')} - ${moment(end).format('DD [de] MMMM [de] YYYY')}`,
              agendaDateFormat: 'dddd, DD [de] MMMM',
              agendaTimeFormat: 'HH:mm',
              agendaTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
            }}
          />
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span>Alta Prioridade</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-600 rounded"></div>
          <span>Média Prioridade</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span>Baixa Prioridade</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Concluída</span>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
          setSelectedSlot(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />
    </div>
  );
};

export default TaskCalendarView;