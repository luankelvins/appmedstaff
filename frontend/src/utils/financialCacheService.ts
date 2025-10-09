/**
 * Serviço de Cache Financeiro
 * 
 * Cache especializado para dados financeiros com:
 * - TTL otimizado para diferentes tipos de dados
 * - Invalidação inteligente baseada em relacionamentos
 * - Cache de consultas complexas
 * - Pré-carregamento de dados frequentes
 */

import { CacheService } from './cacheService';
import type {
  FinancialCategory,
  BankAccount,
  PaymentMethod,
  Revenue,
  Expense,
  FinancialStats,
  FinancialFilter
} from '../types/financial';

export interface FinancialCacheKeys {
  // Dados mestres (TTL longo - 30 minutos)
  CATEGORIES: 'financial:categories';
  CATEGORIES_BY_TYPE: 'financial:categories:type:';
  BANK_ACCOUNTS: 'financial:bank_accounts';
  PAYMENT_METHODS: 'financial:payment_methods';
  
  // Transações (TTL médio - 10 minutos)
  REVENUES: 'financial:revenues';
  EXPENSES: 'financial:expenses';
  REVENUES_FILTERED: 'financial:revenues:filtered:';
  EXPENSES_FILTERED: 'financial:expenses:filtered:';
  
  // Estatísticas (TTL curto - 5 minutos)
  STATS: 'financial:stats';
  STATS_FILTERED: 'financial:stats:filtered:';
  
  // Consultas específicas (TTL médio - 15 minutos)
  REVENUE_BY_ID: 'financial:revenue:';
  EXPENSE_BY_ID: 'financial:expense:';
  
  // Agregações (TTL médio - 10 minutos)
  MONTHLY_SUMMARY: 'financial:monthly_summary:';
  CATEGORY_TOTALS: 'financial:category_totals:';
  PAYMENT_METHOD_USAGE: 'financial:payment_method_usage:';
}

export class FinancialCacheService {
  private cache: CacheService;
  private readonly TTL = {
    MASTER_DATA: 30 * 60 * 1000,    // 30 minutos - dados mestres
    TRANSACTIONS: 10 * 60 * 1000,   // 10 minutos - transações
    STATS: 5 * 60 * 1000,           // 5 minutos - estatísticas
    QUERIES: 15 * 60 * 1000,        // 15 minutos - consultas específicas
    AGGREGATIONS: 10 * 60 * 1000    // 10 minutos - agregações
  };

  constructor() {
    this.cache = new CacheService({
      defaultTTL: this.TTL.TRANSACTIONS,
      maxEntries: 2000,
      strategy: 'LRU',
      enableMetrics: true,
      compressionThreshold: 5000 // 5KB
    });
  }

  // ==================== CATEGORIAS ====================
  
  getCategoriesCache(): FinancialCategory[] | null {
    return this.cache.get<FinancialCategory[]>('financial:categories');
  }

  setCategoriesCache(categories: FinancialCategory[]): void {
    this.cache.set('financial:categories', categories, this.TTL.MASTER_DATA);
  }

  getCategoriesByTypeCache(type: 'income' | 'expense'): FinancialCategory[] | null {
    return this.cache.get<FinancialCategory[]>(`financial:categories:type:${type}`);
  }

  setCategoriesByTypeCache(type: 'income' | 'expense', categories: FinancialCategory[]): void {
    this.cache.set(`financial:categories:type:${type}`, categories, this.TTL.MASTER_DATA);
  }

  // ==================== CONTAS BANCÁRIAS ====================
  
  getBankAccountsCache(): BankAccount[] | null {
    return this.cache.get<BankAccount[]>('financial:bank_accounts');
  }

  setBankAccountsCache(accounts: BankAccount[]): void {
    this.cache.set('financial:bank_accounts', accounts, this.TTL.MASTER_DATA);
  }

  // ==================== FORMAS DE PAGAMENTO ====================
  
  getPaymentMethodsCache(): PaymentMethod[] | null {
    return this.cache.get<PaymentMethod[]>('financial:payment_methods');
  }

  setPaymentMethodsCache(methods: PaymentMethod[]): void {
    this.cache.set('financial:payment_methods', methods, this.TTL.MASTER_DATA);
  }

  // ==================== RECEITAS ====================
  
  getRevenuesCache(filter?: FinancialFilter): Revenue[] | null {
    const key = filter ? 
      `financial:revenues:filtered:${this.generateFilterKey(filter)}` : 
      'financial:revenues';
    return this.cache.get<Revenue[]>(key);
  }

  setRevenuesCache(revenues: Revenue[], filter?: FinancialFilter): void {
    const key = filter ? 
      `financial:revenues:filtered:${this.generateFilterKey(filter)}` : 
      'financial:revenues';
    this.cache.set(key, revenues, this.TTL.TRANSACTIONS);
  }

  getRevenueByIdCache(id: string): Revenue | null {
    return this.cache.get<Revenue>(`financial:revenue:${id}`);
  }

  setRevenueByIdCache(id: string, revenue: Revenue): void {
    this.cache.set(`financial:revenue:${id}`, revenue, this.TTL.QUERIES);
  }

  // ==================== DESPESAS ====================
  
  getExpensesCache(filter?: FinancialFilter): Expense[] | null {
    const key = filter ? 
      `financial:expenses:filtered:${this.generateFilterKey(filter)}` : 
      'financial:expenses';
    return this.cache.get<Expense[]>(key);
  }

  setExpensesCache(expenses: Expense[], filter?: FinancialFilter): void {
    const key = filter ? 
      `financial:expenses:filtered:${this.generateFilterKey(filter)}` : 
      'financial:expenses';
    this.cache.set(key, expenses, this.TTL.TRANSACTIONS);
  }

  getExpenseByIdCache(id: string): Expense | null {
    return this.cache.get<Expense>(`financial:expense:${id}`);
  }

  setExpenseByIdCache(id: string, expense: Expense): void {
    this.cache.set(`financial:expense:${id}`, expense, this.TTL.QUERIES);
  }

  // ==================== ESTATÍSTICAS ====================
  
  getStatsCache(filter?: FinancialFilter): FinancialStats | null {
    const key = filter ? 
      `financial:stats:filtered:${this.generateFilterKey(filter)}` : 
      'financial:stats';
    return this.cache.get<FinancialStats>(key);
  }

  setStatsCache(stats: FinancialStats, filter?: FinancialFilter): void {
    const key = filter ? 
      `financial:stats:filtered:${this.generateFilterKey(filter)}` : 
      'financial:stats';
    this.cache.set(key, stats, this.TTL.STATS);
  }

  // ==================== AGREGAÇÕES ====================
  
  getMonthlySummaryCache(year: number, month: number): any | null {
    return this.cache.get(`financial:monthly_summary:${year}-${month}`);
  }

  setMonthlySummaryCache(year: number, month: number, summary: any): void {
    this.cache.set(`financial:monthly_summary:${year}-${month}`, summary, this.TTL.AGGREGATIONS);
  }

  getCategoryTotalsCache(period: string): any | null {
    return this.cache.get(`financial:category_totals:${period}`);
  }

  setCategoryTotalsCache(period: string, totals: any): void {
    this.cache.set(`financial:category_totals:${period}`, totals, this.TTL.AGGREGATIONS);
  }

  // ==================== INVALIDAÇÃO ====================
  
  /**
   * Invalida cache relacionado a categorias
   */
  invalidateCategoriesCache(): void {
    this.cache.invalidatePattern('financial:categories');
    this.invalidateStatsCache(); // Stats dependem de categorias
  }

  /**
   * Invalida cache relacionado a contas bancárias
   */
  invalidateBankAccountsCache(): void {
    this.cache.invalidatePattern('financial:bank_accounts');
    this.invalidateTransactionsCache(); // Transações podem ter contas
  }

  /**
   * Invalida cache relacionado a formas de pagamento
   */
  invalidatePaymentMethodsCache(): void {
    this.cache.invalidatePattern('financial:payment_methods');
    this.invalidateTransactionsCache(); // Transações podem ter formas de pagamento
  }

  /**
   * Invalida cache de receitas
   */
  invalidateRevenuesCache(): void {
    this.cache.invalidatePattern('financial:revenues');
    this.cache.invalidatePattern('financial:revenue:');
    this.invalidateStatsCache();
    this.invalidateAggregationsCache();
  }

  /**
   * Invalida cache de despesas
   */
  invalidateExpensesCache(): void {
    this.cache.invalidatePattern('financial:expenses');
    this.cache.invalidatePattern('financial:expense:');
    this.invalidateStatsCache();
    this.invalidateAggregationsCache();
  }

  /**
   * Invalida cache de estatísticas
   */
  invalidateStatsCache(): void {
    this.cache.invalidatePattern('financial:stats');
  }

  /**
   * Invalida cache de transações (receitas + despesas)
   */
  invalidateTransactionsCache(): void {
    this.invalidateRevenuesCache();
    this.invalidateExpensesCache();
  }

  /**
   * Invalida cache de agregações
   */
  invalidateAggregationsCache(): void {
    this.cache.invalidatePattern('financial:monthly_summary');
    this.cache.invalidatePattern('financial:category_totals');
    this.cache.invalidatePattern('financial:payment_method_usage');
  }

  /**
   * Invalida todo o cache financeiro
   */
  invalidateAllCache(): void {
    this.cache.invalidatePattern('financial:');
  }

  // ==================== UTILITÁRIOS ====================
  
  /**
   * Gera uma chave única para filtros
   */
  private generateFilterKey(filter: FinancialFilter): string {
    const parts: string[] = [];
    
    if (filter.status?.length) {
      parts.push(`status:${filter.status.sort().join(',')}`);
    }
    
    if (filter.categoryIds?.length) {
      parts.push(`categories:${filter.categoryIds.sort().join(',')}`);
    }
    
    if (filter.startDate) {
      parts.push(`start:${filter.startDate.toISOString().split('T')[0]}`);
    }
    
    if (filter.endDate) {
      parts.push(`end:${filter.endDate.toISOString().split('T')[0]}`);
    }
    
    if (filter.searchTerm) {
      parts.push(`search:${encodeURIComponent(filter.searchTerm)}`);
    }
    
    return parts.join('|');
  }

  /**
   * Obtém métricas do cache
   */
  getMetrics() {
    return this.cache.getMetrics();
  }

  /**
   * Obtém informações do cache
   */
  getInfo() {
    return this.cache.getInfo();
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Pré-carrega dados frequentemente acessados
   */
  async preloadFrequentData(): Promise<void> {
    // Esta função será implementada quando integrarmos com o financialService
    console.log('Preloading frequent financial data...');
  }
}

export const financialCacheService = new FinancialCacheService();