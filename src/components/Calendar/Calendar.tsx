import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent, CalendarViewConfig } from '../../types/feed';
import { feedService } from '../../services/feedService';

interface CalendarProps {
  events?: CalendarEvent[];
  view?: 'month' | 'week' | 'day';
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onCreateEvent?: (date: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  view = 'month',
  onEventClick,
  onDateClick,
  onCreateEvent,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(events);
  const [loading, setLoading] = useState(false);

  // Carregar eventos do calendário
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const startDate = getViewStartDate(currentDate, view);
        const endDate = getViewEndDate(currentDate, view);
        const fetchedEvents = await feedService.getCalendarEvents(startDate, endDate);
        setCalendarEvents([...events, ...fetchedEvents]);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentDate, view, events]);

  // Navegação do calendário
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Formatação de datas
  const formatHeaderDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };

    switch (view) {
      case 'month':
        return currentDate.toLocaleDateString('pt-BR', options);
      case 'week':
        const weekStart = getWeekStart(currentDate);
        const weekEnd = getWeekEnd(currentDate);
        return `${weekStart.getDate()} - ${weekEnd.getDate()} de ${weekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return '';
    }
  };

  // Obter eventos para uma data específica
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Verificar se uma data é hoje
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Verificar se uma data está selecionada
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Manipular clique em data
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  // Manipular clique em evento
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  // Manipular criação de evento
  const handleCreateEvent = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateEvent?.(date);
  };

  // Renderizar visualização mensal
  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = getWeekStart(monthStart);
    const endDate = getWeekEnd(monthEnd);

    const days: Date[] = [];
    const date = new Date(startDate);

    while (date <= endDate) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Cabeçalho dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Dias do mês */}
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isCurrentDay = isToday(day);
            const isSelectedDay = isSelected(day);

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  bg-white p-2 min-h-[100px] cursor-pointer hover:bg-gray-50 relative
                  ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                  ${isCurrentDay ? 'bg-blue-50' : ''}
                  ${isSelectedDay ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-medium
                    ${isCurrentDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {day.getDate()}
                  </span>
                  {onCreateEvent && (
                    <button
                      onClick={(e) => handleCreateEvent(day, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                      title="Criar evento"
                    >
                      <Plus className="h-3 w-3 text-gray-500" />
                    </button>
                  )}
                </div>
                
                {/* Eventos do dia */}
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event, index) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`
                        text-xs p-1 rounded cursor-pointer truncate
                        ${getEventColor(event.priority)}
                        hover:opacity-80
                      `}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ))}
      </div>
    );
  };

  // Renderizar visualização semanal
  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const days: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-50 p-2"></div>
          {days.map(day => (
            <div
              key={day.toISOString()}
              className={`
                bg-gray-50 p-2 text-center cursor-pointer hover:bg-gray-100
                ${isToday(day) ? 'bg-blue-50 text-blue-600' : ''}
                ${isSelected(day) ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              <div className="text-sm font-medium">
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </div>
              <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Grade de horários */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="bg-gray-50 p-2 text-right text-sm text-gray-500 border-r">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {days.map(day => {
                  const hourEvents = getEventsForHour(day, hour);
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="bg-white p-1 min-h-[60px] border-b border-gray-100 relative cursor-pointer hover:bg-gray-50"
                      onClick={() => handleDateClick(day)}
                    >
                      {hourEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`
                            text-xs p-1 rounded mb-1 cursor-pointer
                            ${getEventColor(event.priority)}
                            hover:opacity-80
                          `}
                          title={`${event.title} - ${formatEventTime(event)}`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">{formatEventTime(event)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar visualização diária
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="flex flex-col">
        {/* Cabeçalho do dia */}
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {dayEvents.length} evento(s) agendado(s)
          </p>
        </div>

        {/* Grade de horários */}
        <div className="flex-1 overflow-auto">
          {hours.map(hour => {
            const hourEvents = getEventsForHour(currentDate, hour);
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-2 text-right text-sm text-gray-500 border-r bg-gray-50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-2 min-h-[60px] relative cursor-pointer hover:bg-gray-50">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`
                        p-2 rounded mb-2 cursor-pointer
                        ${getEventColor(event.priority)}
                        hover:opacity-80
                      `}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm opacity-75 mt-1">{formatEventTime(event)}</div>
                      {event.location && (
                        <div className="text-sm opacity-75 mt-1">📍 {event.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatHeaderDate()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Hoje
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateCalendar('prev')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigateCalendar('next')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Conteúdo do calendário */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>
    </div>
  );
};

// Funções auxiliares
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

const getViewStartDate = (date: Date, view: string): Date => {
  switch (view) {
    case 'month':
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      return getWeekStart(monthStart);
    case 'week':
      return getWeekStart(date);
    case 'day':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    default:
      return date;
  }
};

const getViewEndDate = (date: Date, view: string): Date => {
  switch (view) {
    case 'month':
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return getWeekEnd(monthEnd);
    case 'week':
      return getWeekEnd(date);
    case 'day':
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      dayEnd.setHours(23, 59, 59, 999);
      return dayEnd;
    default:
      return date;
  }
};

const getEventsForHour = (date: Date, hour: number): CalendarEvent[] => {
  // Esta função seria implementada para filtrar eventos por hora
  // Por simplicidade, retornando array vazio por enquanto
  return [];
};

const getEventColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const formatEventTime = (event: CalendarEvent): string => {
  if (event.isAllDay) {
    return 'Dia todo';
  }
  
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  return `${start.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${end.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

export default Calendar;