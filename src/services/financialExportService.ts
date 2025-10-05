import { Revenue, Expense, FinancialCategory } from '../types/financial';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeCategories?: boolean;
  includeCharts?: boolean;
  includeAnalytics?: boolean;
}

export interface ExportData {
  revenues: Revenue[];
  expenses: Expense[];
  categories: FinancialCategory[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
  };
}

class FinancialExportService {
  async exportData(data: ExportData, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      case 'pdf':
        return this.exportToPDF(data, options);
      case 'json':
        return this.exportToJSON(data, options);
      default:
        throw new Error(`Formato de exportação não suportado: ${options.format}`);
    }
  }

  private async exportToCSV(data: ExportData, options: ExportOptions): Promise<Blob> {
    let csvContent = '';

    // Cabeçalho do resumo
    csvContent += 'RESUMO FINANCEIRO\n';
    csvContent += `Período,${this.formatDate(options.dateRange.startDate)} - ${this.formatDate(options.dateRange.endDate)}\n`;
    csvContent += `Receita Total,${data.summary.totalRevenue.toFixed(2)}\n`;
    csvContent += `Despesas Total,${data.summary.totalExpenses.toFixed(2)}\n`;
    csvContent += `Lucro Líquido,${data.summary.netIncome.toFixed(2)}\n`;
    csvContent += `Margem de Lucro,${data.summary.profitMargin.toFixed(2)}%\n\n`;

    // Receitas
    csvContent += 'RECEITAS\n';
    csvContent += 'Data,Descrição,Valor,Categoria,Status\n';
    data.revenues.forEach(revenue => {
      csvContent += `${this.formatDate(revenue.dueDate)},${revenue.description},${revenue.amount.toFixed(2)},${revenue.category},${revenue.status}\n`;
    });

    csvContent += '\n';

    // Despesas
    csvContent += 'DESPESAS\n';
    csvContent += 'Data,Descrição,Valor,Categoria,Status\n';
    data.expenses.forEach(expense => {
      csvContent += `${this.formatDate(expense.dueDate)},${expense.description},${expense.amount.toFixed(2)},${expense.category},${expense.status}\n`;
    });

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private async exportToExcel(data: ExportData, options: ExportOptions): Promise<Blob> {
    // Para uma implementação completa, seria necessário usar uma biblioteca como xlsx
    // Por enquanto, retornamos CSV com extensão xlsx
    const csvBlob = await this.exportToCSV(data, options);
    return new Blob([await csvBlob.text()], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private async exportToPDF(data: ExportData, options: ExportOptions): Promise<Blob> {
    // Criando um HTML simples para conversão em PDF
    const htmlContent = this.generateHTMLReport(data, options);
    
    // Para uma implementação completa, seria necessário usar uma biblioteca como jsPDF ou Puppeteer
    // Por enquanto, retornamos HTML
    return new Blob([htmlContent], { type: 'text/html' });
  }

  private async exportToJSON(data: ExportData, options: ExportOptions): Promise<Blob> {
    const exportObject = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: {
          startDate: options.dateRange.startDate.toISOString(),
          endDate: options.dateRange.endDate.toISOString()
        },
        format: options.format,
        options: options
      },
      summary: data.summary,
      revenues: data.revenues,
      expenses: data.expenses,
      ...(options.includeCategories && { categories: data.categories })
    };

    return new Blob([JSON.stringify(exportObject, null, 2)], { 
      type: 'application/json' 
    });
  }

  private generateHTMLReport(data: ExportData, options: ExportOptions): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Financeiro</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .positive { color: green; }
          .negative { color: red; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <p>Período: ${this.formatDate(options.dateRange.startDate)} - ${this.formatDate(options.dateRange.endDate)}</p>
        </div>
        
        <div class="summary">
          <h2>Resumo</h2>
          <p><strong>Receita Total:</strong> R$ ${data.summary.totalRevenue.toFixed(2)}</p>
          <p><strong>Despesas Total:</strong> R$ ${data.summary.totalExpenses.toFixed(2)}</p>
          <p><strong>Lucro Líquido:</strong> <span class="${data.summary.netIncome >= 0 ? 'positive' : 'negative'}">R$ ${data.summary.netIncome.toFixed(2)}</span></p>
          <p><strong>Margem de Lucro:</strong> ${data.summary.profitMargin.toFixed(2)}%</p>
        </div>

        <div class="section">
          <h2>Receitas</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Categoria</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.revenues.map(revenue => `
                <tr>
                  <td>${this.formatDate(revenue.dueDate)}</td>
                  <td>${revenue.description}</td>
                  <td>R$ ${revenue.amount.toFixed(2)}</td>
                  <td>${revenue.category}</td>
                  <td>${revenue.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Despesas</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Categoria</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.expenses.map(expense => `
                <tr>
                  <td>${this.formatDate(expense.dueDate)}</td>
                  <td>${expense.description}</td>
                  <td>R$ ${expense.amount.toFixed(2)}</td>
                  <td>${expense.category}</td>
                  <td>${expense.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateFilename(format: string, dateRange: { startDate: Date; endDate: Date }): string {
    const startDate = dateRange.startDate.toISOString().split('T')[0];
    const endDate = dateRange.endDate.toISOString().split('T')[0];
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `relatorio-financeiro_${startDate}_${endDate}_${timestamp}.${format}`;
  }
}

export const financialExportService = new FinancialExportService();