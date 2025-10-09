import React, { useState } from 'react';
import { Download, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import { financialBackupService } from '../../utils/financialBackupService';

interface FinancialBackupProps {
  className?: string;
}

export const FinancialBackup: React.FC<FinancialBackupProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await financialBackupService.createManualBackup();
      setMessage({ type: 'success', text: 'Backup criado com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      setMessage({ type: 'error', text: 'Erro ao criar backup' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <HardDrive className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Backup de Dados</h3>
          <p className="text-sm text-gray-600">Faça backup dos seus dados financeiros</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Crie um backup completo dos seus dados financeiros incluindo receitas, despesas, 
          categorias, contas bancárias e métodos de pagamento.
        </p>

        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Criando Backup...' : 'Criar Backup'}
        </button>

        <div className="text-xs text-gray-500">
          <p>• O backup incluirá todos os dados financeiros</p>
          <p>• Os dados serão comprimidos e criptografados</p>
          <p>• O arquivo será salvo localmente</p>
        </div>
      </div>
    </div>
  );
};