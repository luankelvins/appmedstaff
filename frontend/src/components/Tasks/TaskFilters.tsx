import React, { useState } from 'react';
import { TaskFilter, TaskStatus, TaskPriority, TaskSort } from '../../types/task';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';

interface TaskFiltersProps {
  filter: TaskFilter;
  sort: TaskSort;
  onFilterChange: (filter: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
  onClearFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filter.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onFilterChange({ ...filter, search: value || undefined });
  };

  const handleStatusChange = (status: TaskStatus, checked: boolean) => {
    const currentStatuses = filter.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onFilterChange({
      ...filter,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handlePriorityChange = (priority: TaskPriority, checked: boolean) => {
    const currentPriorities = filter.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    onFilterChange({
      ...filter,
      priority: newPriorities.length > 0 ? newPriorities : undefined
    });
  };

  const handleDateChange = (field: 'dueDateFrom' | 'dueDateTo', value: string) => {
    onFilterChange({
      ...filter,
      [field]: value ? new Date(value) : undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filter.status?.length) count++;
    if (filter.priority?.length) count++;
    if (filter.assignedTo?.length) count++;
    if (filter.tags?.length) count++;
    if (filter.dueDateFrom || filter.dueDateTo) count++;
    return count;
  };

  const statusOptions = [
    { value: TaskStatus.TODO, label: 'A Fazer', color: 'text-gray-600' },
    { value: TaskStatus.IN_PROGRESS, label: 'Em Andamento', color: 'text-blue-600' },
    { value: TaskStatus.IN_REVIEW, label: 'Em Revisão', color: 'text-purple-600' },
    { value: TaskStatus.DONE, label: 'Concluído', color: 'text-green-600' },
    { value: TaskStatus.CANCELLED, label: 'Cancelado', color: 'text-red-600' }
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Baixa', color: 'text-green-600' },
    { value: TaskPriority.MEDIUM, label: 'Média', color: 'text-yellow-600' },
    { value: TaskPriority.HIGH, label: 'Alta', color: 'text-orange-600' },
    { value: TaskPriority.URGENT, label: 'Urgente', color: 'text-red-600' }
  ];

  const sortOptions = [
    { value: 'title', label: 'Título' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Prioridade' },
    { value: 'due_date', label: 'Data de Vencimento' },
    { value: 'created_at', label: 'Data de Criação' },
    { value: 'updated_at', label: 'Última Atualização' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Search and Toggle */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Buscar tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-gray-50 ${
            getActiveFiltersCount() > 0 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sort.field}
                onChange={(e) => onSortChange({ ...sort, field: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direção
              </label>
              <select
                value={sort.direction}
                onChange={(e) => onSortChange({ ...sort, direction: e.target.value as 'asc' | 'desc' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {statusOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filter.status?.includes(option.value) || false}
                    onChange={(e) => handleStatusChange(option.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {priorityOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filter.priority?.includes(option.value) || false}
                    onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data de Vencimento
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">De</label>
                <input
                  type="date"
                  value={filter.dueDateFrom ? filter.dueDateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('dueDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Até</label>
                <input
                  type="date"
                  value={filter.dueDateTo ? filter.dueDateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('dueDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;