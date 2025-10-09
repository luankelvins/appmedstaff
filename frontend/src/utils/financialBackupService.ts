/**
 * Serviço de Backup Automático Financeiro - Mock Implementation
 * 
 * Funcionalidades:
 * - Backup automático programado
 * - Backup manual sob demanda
 * - Compressão e criptografia de dados
 * - Gerenciamento de retenção
 * - Restauração de backups
 */

// Mock implementation - Supabase removed
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
  private mockBackups: BackupFile[] = [];
  private mockSettings: BackupSettings = {
    autoBackup: true,
    frequency: 'daily',
    retentionDays: 30,
    storageLocation: 'local',
    encryptBackups: true
  };

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
      console.log('Serviço de backup automático inicializado (mock)');
    } catch (error) {
      console.error('Erro ao inicializar serviço de backup:', error);
    }
  }

  /**
   * Obtém as configurações de backup
   */
  async getBackupSettings(): Promise<BackupSettings> {
    console.log('Getting backup settings (mock)');
    return this.mockSettings;
  }

  /**
   * Atualiza as configurações de backup
   */
  async updateBackupSettings(settings: Partial<BackupSettings>): Promise<void> {
    console.log('Updating backup settings (mock):', settings);
    
    this.mockSettings = {
      ...this.mockSettings,
      ...settings
    };

    // Reagendar backup se necessário
    if (settings.autoBackup !== undefined || settings.frequency) {
      this.cancelScheduledBackup();
      if (this.mockSettings.autoBackup) {
        await this.scheduleNextBackup(this.mockSettings);
      }
    }
  }

  /**
   * Cria um backup manual
   */
  async createManualBackup(): Promise<BackupFile> {
    console.log('Creating manual backup (mock)');
    
    if (this.isBackupInProgress) {
      throw new Error('Backup já está em andamento');
    }

    try {
      this.isBackupInProgress = true;
      const backupData = await this.collectBackupData();
      const backupFile = await this.saveBackup(backupData, false);
      
      return backupFile;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Cria um backup automático
   */
  private async createAutomaticBackup(): Promise<void> {
    console.log('Creating automatic backup (mock)');
    
    if (this.isBackupInProgress) {
      console.log('Backup já está em andamento, pulando backup automático');
      return;
    }

    try {
      this.isBackupInProgress = true;
      const backupData = await this.collectBackupData();
      await this.saveBackup(backupData, true);
      
      // Limpar backups antigos
      await this.cleanupOldBackups();
      
      // Agendar próximo backup
      const settings = await this.getBackupSettings();
      await this.scheduleNextBackup(settings);
    } catch (error) {
      console.error('Erro no backup automático:', error);
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Coleta todos os dados financeiros para backup
   */
  private async collectBackupData(): Promise<BackupData> {
    console.log('Collecting backup data (mock)');
    
    // Mock data collection
    const backupData: BackupData = {
      metadata: {
        version: '1.0.0',
        timestamp: new Date(),
        userId: 'mock_user_id',
        dataTypes: ['categories', 'revenues', 'expenses', 'settings'],
        totalRecords: 0
      },
      categories: [],
      bankAccounts: [],
      paymentMethods: [],
      revenues: [],
      expenses: [],
      settings: await this.getFinancialSettings()
    };

    return backupData;
  }

  /**
   * Salva o backup
   */
  private async saveBackup(backupData: BackupData, isAutomatic: boolean): Promise<BackupFile> {
    console.log('Saving backup (mock)');
    
    const backupFile: BackupFile = {
      id: `backup_${Date.now()}`,
      filename: `financial_backup_${new Date().toISOString().split('T')[0]}.json`,
      size: 1024, // mock size
      createdAt: new Date(),
      userId: backupData.metadata.userId,
      dataTypes: backupData.metadata.dataTypes,
      isAutomatic: isAutomatic
    };

    this.mockBackups.push(backupFile);
    
    // Simular download para backup manual
    if (!isAutomatic) {
      this.downloadBackup(backupFile, new Blob([JSON.stringify(backupData)]));
    }

    return backupFile;
  }

  /**
   * Simula o download do backup
   */
  private downloadBackup(backupFile: BackupFile, blob: Blob): void {
    console.log('Downloading backup (mock):', backupFile.filename);
    // Mock implementation - just log
  }

  /**
   * Lista todos os backups
   */
  async listBackups(): Promise<BackupFile[]> {
    console.log('Listing backups (mock)');
    return [...this.mockBackups].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Remove backups antigos baseado na configuração de retenção
   */
  private async cleanupOldBackups(): Promise<void> {
    console.log('Cleaning up old backups (mock)');
    
    const settings = await this.getBackupSettings();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);
    
    const backupsToDelete = this.mockBackups.filter(backup => 
      backup.createdAt < cutoffDate && backup.isAutomatic === true
    );
    
    console.log(`Removing ${backupsToDelete.length} old backups`);
    
    // Remove from mock array
    this.mockBackups = this.mockBackups.filter(backup => 
      !backupsToDelete.includes(backup)
    );
  }

  /**
   * Agenda o próximo backup automático
   */
  private async scheduleNextBackup(settings: BackupSettings): Promise<void> {
    if (!settings.autoBackup) return;

    this.cancelScheduledBackup();
    
    const nextBackupDate = this.calculateNextBackupDate(settings);
    const delay = nextBackupDate.getTime() - Date.now();
    
    console.log(`Próximo backup agendado para: ${nextBackupDate.toLocaleString()}`);
    
    this.backupTimer = setTimeout(async () => {
      await this.createAutomaticBackup();
    }, delay);
  }

  /**
   * Cancela o backup agendado
   */
  private cancelScheduledBackup(): void {
    if (this.backupTimer) {
      clearTimeout(this.backupTimer);
      this.backupTimer = null;
    }
  }

  /**
   * Calcula a data do próximo backup
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
      default:
        nextBackup.setDate(now.getDate() + 1);
    }
    
    // Definir horário para 2:00 AM
    nextBackup.setHours(2, 0, 0, 0);
    
    return nextBackup;
  }

  /**
   * Obtém a data do último backup
   */
  private async getLastBackupDate(): Promise<Date | undefined> {
    console.log('Getting last backup date (mock)');
    
    if (this.mockBackups.length === 0) {
      return undefined;
    }
    
    const lastBackup = this.mockBackups
      .filter(backup => backup.isAutomatic === true)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    
    return lastBackup?.createdAt;
  }

  /**
   * Obtém configurações financeiras
   */
  private async getFinancialSettings(): Promise<FinancialSettings> {
    console.log('Getting financial settings (mock)');
    
    // Mock financial settings
    return {
      defaultCurrency: 'BRL',
      fiscalYearStart: 1, // Janeiro
      notificationSettings: {
        dueDateReminder: 3,
        overdueReminder: 1,
        recurrenceConfirmation: true,
        lowBalanceAlert: 1000
      },
      autoApprovalLimits: {
        revenue: 10000,
        expense: 5000
      },
      backupSettings: {
        autoBackup: true,
        frequency: 'daily',
        retentionDays: 30
      }
    };
  }

  /**
   * Destrói o serviço e limpa recursos
   */
  destroy(): void {
    this.cancelScheduledBackup();
    console.log('Serviço de backup destruído');
  }
}

export const financialBackupService = FinancialBackupService.getInstance();