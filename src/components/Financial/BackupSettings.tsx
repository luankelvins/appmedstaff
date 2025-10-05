import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Clock, 
  Shield, 
  HardDrive,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { financialBackupService } from '../../services/financialBackupService';
import type { BackupSettings, BackupFile } from '../../types/financial';

interface BackupSettingsComponentProps {
  className?: string;
}

export const BackupSettings: React.FC<BackupSettingsComponentProps> = ({ className = '' }) => {
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: false,
    frequency: 'weekly',
    retentionDays: 30,
    lastBackupDate: undefined,
    nextBackupDate: undefined,
    storageLocation: 'local',
    encryptBackups: true
  });
  
  const [backupHistory, setBackupHistory] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadBackupHistory();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await financialBackupService.getBackupSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const history = await financialBackupService.listBackups();
      setBackupHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await financialBackupService.updateBackupSettings(settings);
      
      // TODO: Implementar agendamento automático
      if (settings.autoBackup) {
        console.log('Agendando backup automático');
      } else {
        console.log('Cancelando backup automático');
      }
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualBackup = async () => {
    setLoading(true);
    try {
      await financialBackupService.createManualBackup();
      await loadBackupHistory();
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

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar método de restauração
      console.log('Restaurando backup:', backupId);
      setMessage({ type: 'success', text: 'Funcionalidade de restauração será implementada em breve!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      setMessage({ type: 'error', text: 'Erro ao restaurar backup' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HardDrive className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configurações de Backup</h2>
            <p className="text-sm text-gray-600">Gerencie backups automáticos dos seus dados financeiros</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${
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

      <div className="p-6 space-y-6">
        {/* Configurações Gerais */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações Gerais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Backup Automático</span>
              </label>
              <p className="text-xs text-gray-500">Criar backups automaticamente conforme a frequência definida</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.encryptBackups}
                  onChange={(e) => setSettings(prev => ({ ...prev, encryptBackups: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Criptografar Backups</span>
              </label>
              <p className="text-xs text-gray-500">Proteger backups com criptografia</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Frequência
              </label>
              <select
                value={settings.frequency}
                onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!settings.autoBackup}
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Retenção (dias)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.retentionDays}
                onChange={(e) => setSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Local de Armazenamento
            </label>
            <select
              value={settings.storageLocation}
              onChange={(e) => setSettings(prev => ({ ...prev, storageLocation: e.target.value as 'local' | 'cloud' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="local">Local</option>
              <option value="cloud">Nuvem</option>
            </select>
          </div>
        </div>

        {/* Status do Backup */}
        {settings.autoBackup && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Status do Backup
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Último Backup</span>
                </div>
                <p className="text-sm text-gray-600">
                  {settings.lastBackupDate ? formatDate(settings.lastBackupDate) : 'Nenhum backup realizado'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Próximo Backup</span>
                </div>
                <p className="text-sm text-gray-600">
                  {settings.nextBackupDate ? formatDate(settings.nextBackupDate) : 'Não agendado'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>

          <button
            onClick={handleManualBackup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Backup Manual
          </button>
        </div>

        {/* Histórico de Backups */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Histórico de Backups
          </h3>

          {backupHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HardDrive className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum backup encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backupHistory.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{backup.filename}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        backup.isAutomatic 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {backup.isAutomatic ? 'Automático' : 'Manual'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>{formatFileSize(backup.size)}</span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Seguro
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreBackup(backup.id)}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-3 h-3" />
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};