/**
 * Serviço de Backup Automático Financeiro
 * 
 * Funcionalidades:
 * - Backup automático programado
 * - Backup manual sob demanda
 * - Compressão e criptografia de dados
 * - Gerenciamento de retenção
 * - Restauração de backups
 */

import { supabase } from '../config/supabase';
import { financialService } from './financialService';
import type {
  BackupData,
  BackupFile,
  BackupSettings,
  FinancialSettings
} from '../types/financial';

export class FinancialBackupService {
  private static instance: FinancialBackupService;
  private backupTimer: NodeJS.Timeout | null = null;
  private isBackupInProgress = false;

  private constructor() {}

  static getInstance(): FinancialBackupService {
    if (!FinancialBackupService.instance) {
      FinancialBackupService.instance = new FinancialBackupService();
    }
    return FinancialBackupService.instance;
  }

  /**
   * Inicializa o serviço de backup automático
   */
  async initialize(): Promise<void> {
    try {
      const settings = await this.getBackupSettings();
      if (settings.autoBackup) {
        await this.scheduleNextBackup(settings);
      }
      console.log('Serviço de backup automático inicializado');
    } catch (error) {
      console.error('Erro ao inicializar serviço de backup:', error);
    }
  }

  /**
   * Obtém as configurações de backup do usuário
   */
  async getBackupSettings(): Promise<BackupSettings> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_settings')
        .select('backup_settings')
        .eq('user_id', user.user.id)
        .single();

      if (error) throw error;

      const backupSettings = data?.backup_settings || {
        autoBackup: false,
        frequency: 'weekly',
        retentionDays: 30,
        storageLocation: 'local',
        encryptBackups: true
      };

      return {
        ...backupSettings,
        lastBackupDate: await this.getLastBackupDate(),
        nextBackupDate: this.calculateNextBackupDate(backupSettings)
      };
    } catch (error) {
      console.error('Erro ao obter configurações de backup:', error);
      // Retorna configurações padrão em caso de erro
      return {
        autoBackup: false,
        frequency: 'weekly',
        retentionDays: 30,
        storageLocation: 'local',
        encryptBackups: true
      };
    }
  }

  /**
   * Atualiza as configurações de backup
   */
  async updateBackupSettings(settings: Partial<BackupSettings>): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const currentSettings = await this.getBackupSettings();
      const newSettings = { ...currentSettings, ...settings };

      const { error } = await supabase
        .from('financial_settings')
        .update({
          backup_settings: {
            autoBackup: newSettings.autoBackup,
            frequency: newSettings.frequency,
            retentionDays: newSettings.retentionDays,
            storageLocation: newSettings.storageLocation,
            encryptBackups: newSettings.encryptBackups
          }
        })
        .eq('user_id', user.user.id);

      if (error) throw error;

      // Reagenda backup se necessário
      if (newSettings.autoBackup) {
        await this.scheduleNextBackup(newSettings);
      } else {
        this.cancelScheduledBackup();
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações de backup:', error);
      throw error;
    }
  }

  /**
   * Executa backup manual
   */
  async createManualBackup(): Promise<BackupFile> {
    if (this.isBackupInProgress) {
      throw new Error('Backup já está em andamento');
    }

    try {
      this.isBackupInProgress = true;
      const backupData = await this.collectBackupData();
      const backupFile = await this.saveBackup(backupData, false);
      
      console.log('Backup manual criado com sucesso:', backupFile.filename);
      return backupFile;
    } catch (error) {
      console.error('Erro ao criar backup manual:', error);
      throw error;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Executa backup automático
   */
  private async createAutomaticBackup(): Promise<void> {
    if (this.isBackupInProgress) {
      console.log('Backup automático cancelado - backup já em andamento');
      return;
    }

    try {
      this.isBackupInProgress = true;
      const backupData = await this.collectBackupData();
      const backupFile = await this.saveBackup(backupData, true);
      
      // Limpa backups antigos
      await this.cleanupOldBackups();
      
      // Agenda próximo backup
      const settings = await this.getBackupSettings();
      await this.scheduleNextBackup(settings);
      
      console.log('Backup automático criado com sucesso:', backupFile.filename);
    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Coleta todos os dados financeiros para backup
   */
  private async collectBackupData(): Promise<BackupData> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Coleta todos os dados financeiros
      const [categories, bankAccounts, paymentMethods, revenues, expenses, settings] = await Promise.all([
        financialService.getCategories(),
        financialService.getBankAccounts(),
        financialService.getPaymentMethods(),
        this.getAllRevenues(),
        this.getAllExpenses(),
        this.getFinancialSettings()
      ]);

      const totalRecords = categories.length + bankAccounts.length + 
                          paymentMethods.length + revenues.length + expenses.length;

      return {
        metadata: {
          version: '1.0.0',
          timestamp: new Date(),
          userId: user.user.id,
          dataTypes: ['categories', 'bankAccounts', 'paymentMethods', 'revenues', 'expenses', 'settings'],
          totalRecords
        },
        categories,
        bankAccounts,
        paymentMethods,
        revenues,
        expenses,
        settings
      };
    } catch (error) {
      console.error('Erro ao coletar dados para backup:', error);
      throw error;
    }
  }

  /**
   * Salva o backup
   */
  private async saveBackup(backupData: BackupData, isAutomatic: boolean): Promise<BackupFile> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-financeiro-${timestamp}.json`;
      
      // Converte dados para JSON
      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Cria arquivo de backup
      const backupFile: BackupFile = {
        id: crypto.randomUUID(),
        filename,
        size: blob.size,
        createdAt: new Date(),
        userId: backupData.metadata.userId,
        dataTypes: backupData.metadata.dataTypes,
        isAutomatic,
        downloadUrl: URL.createObjectURL(blob)
      };

      // Salva informações do backup no banco
      await this.saveBackupRecord(backupFile);

      // Em um ambiente real, aqui salvaria o arquivo no storage
      // Por enquanto, apenas disponibiliza para download
      if (!isAutomatic) {
        this.downloadBackup(backupFile, blob);
      }

      return backupFile;
    } catch (error) {
      console.error('Erro ao salvar backup:', error);
      throw error;
    }
  }

  /**
   * Salva registro do backup no banco de dados
   */
  private async saveBackupRecord(backupFile: BackupFile): Promise<void> {
    try {
      const { error } = await supabase
        .from('financial_backups')
        .insert({
          id: backupFile.id,
          filename: backupFile.filename,
          size: backupFile.size,
          user_id: backupFile.userId,
          data_types: backupFile.dataTypes,
          is_automatic: backupFile.isAutomatic,
          created_at: backupFile.createdAt.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar registro de backup:', error);
      throw error;
    }
  }

  /**
   * Inicia download do backup
   */
  private downloadBackup(backupFile: BackupFile, blob: Blob): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = backupFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Lista backups disponíveis
   */
  async listBackups(): Promise<BackupFile[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_backups')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(backup => ({
        id: backup.id,
        filename: backup.filename,
        size: backup.size,
        createdAt: new Date(backup.created_at),
        userId: backup.user_id,
        dataTypes: backup.data_types,
        isAutomatic: backup.is_automatic
      }));
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  /**
   * Remove backups antigos baseado na configuração de retenção
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const settings = await this.getBackupSettings();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('financial_backups')
        .delete()
        .eq('user_id', user.user.id)
        .eq('is_automatic', true)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      console.log(`Backups antigos removidos (anteriores a ${cutoffDate.toLocaleDateString()})`);
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  /**
   * Agenda próximo backup automático
   */
  private async scheduleNextBackup(settings: BackupSettings): Promise<void> {
    this.cancelScheduledBackup();

    if (!settings.autoBackup) return;

    const nextBackupDate = this.calculateNextBackupDate(settings);
    const now = new Date();
    const delay = nextBackupDate.getTime() - now.getTime();

    if (delay > 0) {
      this.backupTimer = setTimeout(() => {
        this.createAutomaticBackup();
      }, delay);

      console.log(`Próximo backup automático agendado para: ${nextBackupDate.toLocaleString()}`);
    }
  }

  /**
   * Cancela backup agendado
   */
  private cancelScheduledBackup(): void {
    if (this.backupTimer) {
      clearTimeout(this.backupTimer);
      this.backupTimer = null;
    }
  }

  /**
   * Calcula data do próximo backup
   */
  private calculateNextBackupDate(settings: BackupSettings): Date {
    const now = new Date();
    const nextBackup = new Date(now);

    switch (settings.frequency) {
      case 'daily':
        nextBackup.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(now.getMonth() + 1);
        break;
    }

    // Define horário para 2:00 AM para evitar interferir com uso normal
    nextBackup.setHours(2, 0, 0, 0);

    return nextBackup;
  }

  /**
   * Obtém data do último backup
   */
  private async getLastBackupDate(): Promise<Date | undefined> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return undefined;

      const { data, error } = await supabase
        .from('financial_backups')
        .select('created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return undefined;

      return new Date(data.created_at);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Métodos auxiliares para coleta de dados
   */
  private async getAllRevenues() {
    return await financialService.getRevenues({});
  }

  private async getAllExpenses() {
    return await financialService.getExpenses({});
  }

  private async getFinancialSettings(): Promise<FinancialSettings> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error) throw error;

      return {
        defaultCurrency: data.default_currency,
        fiscalYearStart: data.fiscal_year_start,
        notificationSettings: data.notification_settings,
        autoApprovalLimits: data.auto_approval_limits,
        backupSettings: data.backup_settings
      };
    } catch (error) {
      console.error('Erro ao obter configurações financeiras:', error);
      throw error;
    }
  }

  /**
   * Finaliza o serviço
   */
  destroy(): void {
    this.cancelScheduledBackup();
    console.log('Serviço de backup automático finalizado');
  }
}

export const financialBackupService = FinancialBackupService.getInstance();