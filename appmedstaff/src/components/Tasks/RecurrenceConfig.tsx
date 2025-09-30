import React, { useState, useEffect } from 'react';
import { RecurrenceRule, RecurrenceFrequency, RecurrenceEndType, WeekDay } from '../../types/task';
import { Calendar, Clock, Repeat, X } from 'lucide-react';

interface RecurrenceConfigProps {
  recurrenceRule?: RecurrenceRule;
  onChange: (rule: RecurrenceRule | undefined) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const RecurrenceConfig: React.FC<RecurrenceConfigProps> = ({
  recurrenceRule,
  onChange,
  isEnabled,
  onToggle
}) => {
  const [rule, setRule] = useState<RecurrenceRule>({
    frequency: RecurrenceFrequency.DAILY,
    interval: 1,
    endType: RecurrenceEndType.NEVER,
    weekDays: [],
  });

  useEffect(() => {
    if (recurrenceRule) {
      setRule(recurrenceRule);
    }
  }, [recurrenceRule]);

  const handleRuleChange = (updates: Partial<RecurrenceRule>) => {
    const newRule = { ...rule, ...updates };
    setRule(newRule);
    onChange(newRule);
  };

  const handleToggle = (enabled: boolean) => {
    onToggle(enabled);
    if (!enabled) {
      onChange(undefined);
    } else {
      onChange(rule);
    }
  };

  const getFrequencyLabel = (frequency: RecurrenceFrequency) => {
    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        return rule.interval === 1 ? 'dia' : 'dias';
      case RecurrenceFrequency.WEEKLY:
        return rule.interval === 1 ? 'semana' : 'semanas';
      case RecurrenceFrequency.MONTHLY:
        return rule.interval === 1 ? 'mês' : 'meses';
      case RecurrenceFrequency.YEARLY:
        return rule.interval === 1 ? 'ano' : 'anos';
      default:
        return 'dia';
    }
  };

  const weekDayLabels = {
    [WeekDay.SUNDAY]: 'Dom',
    [WeekDay.MONDAY]: 'Seg',
    [WeekDay.TUESDAY]: 'Ter',
    [WeekDay.WEDNESDAY]: 'Qua',
    [WeekDay.THURSDAY]: 'Qui',
    [WeekDay.FRIDAY]: 'Sex',
    [WeekDay.SATURDAY]: 'Sáb'
  };

  const handleWeekDayToggle = (day: WeekDay) => {
    const currentDays = rule.weekDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    handleRuleChange({ weekDays: newDays });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Toggle de Recorrência */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Repeat className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">Repetir tarefa</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            } mt-0.5 ml-0.5`} />
          </div>
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          {/* Frequência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repetir a cada
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="999"
                value={rule.interval}
                onChange={(e) => handleRuleChange({ interval: parseInt(e.target.value) || 1 })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={rule.frequency}
                onChange={(e) => handleRuleChange({ frequency: e.target.value as RecurrenceFrequency })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={RecurrenceFrequency.DAILY}>
                  {getFrequencyLabel(RecurrenceFrequency.DAILY)}
                </option>
                <option value={RecurrenceFrequency.WEEKLY}>
                  {getFrequencyLabel(RecurrenceFrequency.WEEKLY)}
                </option>
                <option value={RecurrenceFrequency.MONTHLY}>
                  {getFrequencyLabel(RecurrenceFrequency.MONTHLY)}
                </option>
                <option value={RecurrenceFrequency.YEARLY}>
                  {getFrequencyLabel(RecurrenceFrequency.YEARLY)}
                </option>
              </select>
            </div>
          </div>

          {/* Dias da semana (apenas para frequência semanal) */}
          {rule.frequency === RecurrenceFrequency.WEEKLY && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repetir nos dias
              </label>
              <div className="flex space-x-1">
                {Object.entries(weekDayLabels).map(([day, label]) => {
                  const dayNum = parseInt(day) as WeekDay;
                  const isSelected = rule.weekDays?.includes(dayNum) || false;
                  
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWeekDayToggle(dayNum)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dia do mês (para frequência mensal) */}
          {rule.frequency === RecurrenceFrequency.MONTHLY && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia do mês
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={rule.monthDay || 1}
                onChange={(e) => handleRuleChange({ monthDay: parseInt(e.target.value) || 1 })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Configurações anuais */}
          {rule.frequency === RecurrenceFrequency.YEARLY && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês
                </label>
                <select
                  value={rule.yearMonth || 1}
                  onChange={(e) => handleRuleChange({ yearMonth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={rule.yearDay || 1}
                  onChange={(e) => handleRuleChange({ yearDay: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Fim da recorrência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminar
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="endType"
                  value={RecurrenceEndType.NEVER}
                  checked={rule.endType === RecurrenceEndType.NEVER}
                  onChange={(e) => handleRuleChange({ endType: e.target.value as RecurrenceEndType })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Nunca</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="endType"
                  value={RecurrenceEndType.AFTER_OCCURRENCES}
                  checked={rule.endType === RecurrenceEndType.AFTER_OCCURRENCES}
                  onChange={(e) => handleRuleChange({ endType: e.target.value as RecurrenceEndType })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Após</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={rule.occurrences || 1}
                  onChange={(e) => handleRuleChange({ occurrences: parseInt(e.target.value) || 1 })}
                  disabled={rule.endType !== RecurrenceEndType.AFTER_OCCURRENCES}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span className="text-sm text-gray-700">ocorrências</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="endType"
                  value={RecurrenceEndType.ON_DATE}
                  checked={rule.endType === RecurrenceEndType.ON_DATE}
                  onChange={(e) => handleRuleChange({ endType: e.target.value as RecurrenceEndType })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Em</span>
                <input
                  type="date"
                  value={rule.endDate ? rule.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleRuleChange({ 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  disabled={rule.endType !== RecurrenceEndType.ON_DATE}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
            </div>
          </div>

          {/* Resumo da recorrência */}
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Resumo:</strong> Repetir a cada {rule.interval} {getFrequencyLabel(rule.frequency)}
              {rule.frequency === RecurrenceFrequency.WEEKLY && rule.weekDays && rule.weekDays.length > 0 && (
                <span> nos dias: {rule.weekDays.map(d => weekDayLabels[d]).join(', ')}</span>
              )}
              {rule.endType === RecurrenceEndType.AFTER_OCCURRENCES && (
                <span>, por {rule.occurrences} ocorrências</span>
              )}
              {rule.endType === RecurrenceEndType.ON_DATE && rule.endDate && (
                <span> até {rule.endDate.toLocaleDateString('pt-BR')}</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceConfig;