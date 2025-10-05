import React, { useState, useEffect } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import type { FinancialFilter, FinancialCategory, TransactionStatus } from '../../types/financial';

interface AdvancedFiltersProps {
  filter: FinancialFilter;
  onFilterChange: (filter: FinancialFilter) => void;
  categories: FinancialCategory[];
  type: 'income' | 'expense';
  className?: string;
}

const statusOptions: { value: TransactionStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
  { value: 'confirmed', label: 'Confirmado', color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelado', color: 'text-red-600' },
  { value: 'overdue', label: 'Vencido', color: 'text-red-800' }
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filter,
  onFilterChange,
  categories,
  type,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilter, setLocalFilter] = useState<FinancialFilter>(filter);

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(cat => cat.type === type && cat.isActive);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const handleFilterUpdate = (updates: Partial<FinancialFilter>) => {
    const newFilter = { ...localFilter, ...updates };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    handleFilterUpdate({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentIds = localFilter.categoryIds || [];
    const newIds = checked
      ? [...currentIds, categoryId]
      : currentIds.filter(id => id !== categoryId);
    
    handleFilterUpdate({
      categoryIds: newIds.length > 0 ? newIds : undefined
    });
  };

  const handleStatusChange = (status: TransactionStatus, checked: boolean) => {
    const currentStatuses = localFilter.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    handleFilterUpdate({
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handleAmountRangeChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    handleFilterUpdate({
      [field]: numValue
    });
  };

  const clearAllFilters = () => {
    const clearedFilter: FinancialFilter = {};
    setLocalFilter(clearedFilter);
    onFilterChange(clearedFilter);
  };

  const hasActiveFilters = () => {
    return !!(
      localFilter.startDate ||
      localFilter.endDate ||
      localFilter.categoryIds?.length ||
      localFilter.status?.length ||
      localFilter.minAmount ||
      localFilter.maxAmount ||
      localFilter.searchTerm
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header dos filtros */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900">
              Filtros Avançados
            </h3>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtros ativos
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpar todos
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo dos filtros */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Filtro de Período */}
          <DateRangeFilter
            startDate={localFilter.startDate?.toISOString().split('T')[0] || ''}
            endDate={localFilter.endDate?.toISOString().split('T')[0] || ''}
            onStartDateChange={(date) => handleDateRangeChange(date, localFilter.endDate?.toISOString().split('T')[0] || '')}
            onEndDateChange={(date) => handleDateRangeChange(localFilter.startDate?.toISOString().split('T')[0] || '', date)}
            onClear={() => handleDateRangeChange('', '')}
            label="Período"
          />

          {/* Filtro de Categorias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorias
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {filteredCategories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={localFilter.categoryIds?.includes(category.id) || false}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Filtro de Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={localFilter.status?.includes(option.value) || false}
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

          {/* Filtro de Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa de Valor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localFilter.minAmount || ''}
                  onChange={(e) => handleAmountRangeChange('minAmount', e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localFilter.maxAmount || ''}
                  onChange={(e) => handleAmountRangeChange('maxAmount', e.target.value)}
                  placeholder="R$ 999.999,99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filtro de Recorrência */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localFilter.isRecurrent || false}
                onChange={(e) => handleFilterUpdate({ isRecurrent: e.target.checked || undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Apenas transações recorrentes
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};