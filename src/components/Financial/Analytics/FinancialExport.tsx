import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Calendar } from 'lucide-react';
import { financialExportService, ExportOptions, ExportData } from '../../../services/financialExportService';
import { Revenue, Expense, FinancialCategory } from '../../../types/financial';

interface FinancialExportProps {
  revenues: Revenue[];
  expenses: Expense[];
  categories: FinancialCategory[];
}

export const FinancialExport: React.FC<FinancialExportProps> = ({
  revenues,
  expenses,
  categories
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    },
    includeCategories: true,
    includeCharts: false,
    includeAnalytics: true
  });

  const formatIcons = {
    csv: FileText,
    excel: FileSpreadsheet,
    pdf: File,
    json: File
  };

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
    json: 'JSON'
  };

  const calculateSummary = () => {
    const filteredRevenues = revenues.filter(revenue => 
      revenue.dueDate >= exportOptions.dateRange.startDate && 
      revenue.dueDate <= exportOptions.dateRange.endDate
    );
    
    const filteredExpenses = expenses.filter(expense => 
      expense.dueDate >= exportOptions.dateRange.startDate && 
      expense.dueDate <= exportOptions.dateRange.endDate
    );

    const totalRevenue = filteredRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin
    };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filteredRevenues = revenues.filter(revenue => 
        revenue.dueDate >= exportOptions.dateRange.startDate && 
        revenue.dueDate <= exportOptions.dateRange.endDate
      );
      
      const filteredExpenses = expenses.filter(expense => 
        expense.dueDate >= exportOptions.dateRange.startDate && 
        expense.dueDate <= exportOptions.dateRange.endDate
      );

      const exportData: ExportData = {
        revenues: filteredRevenues,
        expenses: filteredExpenses,
        categories,
        summary: calculateSummary()
      };

      const blob = await financialExportService.exportData(exportData, exportOptions);
      const filename = financialExportService.generateFilename(
        exportOptions.format, 
        exportOptions.dateRange
      );
      
      financialExportService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = calculateSummary();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Download className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Exportar Dados Financeiros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opções de Formato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Formato de Exportação
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(formatLabels).map(([format, label]) => {
              const Icon = formatIcons[format as keyof typeof formatIcons];
              return (
                <button
                  key={format}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format as any }))}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    exportOptions.format === format
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Período
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
              <input
                type="date"
                value={exportOptions.dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    startDate: new Date(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Final</label>
              <input
                type="date"
                value={exportOptions.dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    endDate: new Date(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opções Adicionais */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Opções Adicionais
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeCategories}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeCategories: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir categorias</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeAnalytics}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeAnalytics: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir análises</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeCharts}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeCharts: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={exportOptions.format !== 'pdf'}
            />
            <span className="ml-2 text-sm text-gray-700">
              Incluir gráficos {exportOptions.format !== 'pdf' && '(apenas PDF)'}
            </span>
          </label>
        </div>
      </div>

      {/* Preview do Resumo */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Preview do Período</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Receitas:</span>
            <div className="font-medium text-green-600">
              R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Despesas:</span>
            <div className="font-medium text-red-600">
              R$ {summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Lucro:</span>
            <div className={`font-medium ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {summary.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Margem:</span>
            <div className={`font-medium ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.profitMargin.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Exportação */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar Dados'}
        </button>
      </div>
    </div>
  );
};