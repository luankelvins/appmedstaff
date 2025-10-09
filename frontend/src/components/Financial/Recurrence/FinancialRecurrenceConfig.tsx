import React, { useState, useEffect } from 'react';
import { RecurrenceConfig, RecurrencePeriod } from '../../../types/financial';
import { Calendar, Clock, Repeat, X } from 'lucide-react';

interface FinancialRecurrenceConfigProps {
  recurrenceConfig?: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const FinancialRecurrenceConfig: React.FC<FinancialRecurrenceConfigProps> = ({
  recurrenceConfig,
  onChange,
  isEnabled,
  onToggle
}) => {
  const [config, setConfig] = useState<RecurrenceConfig>({
    isRecurrent: false,
    period: 'monthly',
    interval: 1,
  });

  useEffect(() => {
    if (recurrenceConfig) {
      setConfig(recurrenceConfig);
    }
  }, [recurrenceConfig]);

  const handleToggle = (enabled: boolean) => {
    onToggle(enabled);
    const newConfig = { ...config, isRecurrent: enabled };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const handleConfigChange = (updates: Partial<RecurrenceConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const getPeriodLabel = (period: RecurrencePeriod, interval: number = 1) => {
    const labels = {
      daily: interval === 1 ? 'dia' : 'dias',
      weekly: interval === 1 ? 'semana' : 'semanas',
      biweekly: 'quinzena',
      monthly: interval === 1 ? 'mês' : 'meses',
      quarterly: interval === 1 ? 'trimestre' : 'trimestres',
      semiannual: interval === 1 ? 'semestre' : 'semestres',
      annual: interval === 1 ? 'ano' : 'anos'
    };
    return labels[period];
  };

  const getRecurrenceSummary = () => {
    if (!config.isRecurrent) return '';
    
    let summary = `Repetir a cada ${config.interval || 1} ${getPeriodLabel(config.period || 'monthly', config.interval)}`;
    
    if (config.endDate) {
      summary += ` até ${new Date(config.endDate).toLocaleDateString('pt-BR')}`;
    } else if (config.maxOccurrences) {
      summary += ` por ${config.maxOccurrences} ocorrências`;
    }
    
    return summary;
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Toggle de Recorrência */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Repeat className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">Transação recorrente</span>
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
          {/* Periodicidade e Intervalo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodicidade
              </label>
              <select
                value={config.period || 'monthly'}
                onChange={(e) => handleConfigChange({ period: e.target.value as RecurrencePeriod })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>

            {config.period !== 'biweekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repetir a cada
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={config.interval || 1}
                    onChange={(e) => handleConfigChange({ interval: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {getPeriodLabel(config.period || 'monthly', config.interval)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Fim da recorrência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terminar recorrência
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="endType"
                  checked={!config.endDate && !config.maxOccurrences}
                  onChange={() => handleConfigChange({ endDate: undefined, maxOccurrences: undefined })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Nunca</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="endType"
                  checked={!!config.maxOccurrences}
                  onChange={() => handleConfigChange({ endDate: undefined, maxOccurrences: 12 })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Após</span>
                <input
                  type="number"
                  min="1"
                  value={config.maxOccurrences || ''}
                  onChange={(e) => handleConfigChange({ 
                    maxOccurrences: parseInt(e.target.value) || undefined,
                    endDate: undefined 
                  })}
                  disabled={!config.maxOccurrences}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span className="text-sm text-gray-700">ocorrências</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="endType"
                  checked={!!config.endDate}
                  onChange={() => handleConfigChange({ 
                    endDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
                    maxOccurrences: undefined 
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Em</span>
                <input
                  type="date"
                  value={config.endDate ? new Date(config.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleConfigChange({ 
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                    maxOccurrences: undefined
                  })}
                  disabled={!config.endDate}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
            </div>
          </div>

          {/* Resumo da recorrência */}
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Resumo:</strong> {getRecurrenceSummary()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialRecurrenceConfig;