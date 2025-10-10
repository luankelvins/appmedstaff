import { httpClient } from './httpClient';

export interface Contrato {
  id: string;
  numero_contrato: string;
  tipo_contrato: 'pf' | 'pj';
  cliente_id: string;
  cliente_nome: string;
  data_inicio: string;
  data_vencimento: string;
  renovacao_automatica?: boolean;
  servicos_contratados: Record<string, any>;
  condicoes_comerciais: Record<string, any>;
  clausulas_juridicas?: string;
  documentos?: string[];
  status: 'rascunho' | 'ativo' | 'suspenso' | 'encerrado';
  responsavel_comercial?: string;
  responsavel_juridico?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContratoFilters {
  status?: string;
  tipo_contrato?: string;
  cliente_id?: string;
  responsavel_comercial?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
}

export interface ContratoSearchParams {
  q?: string;
  numero_contrato?: string;
  cliente_nome?: string;
  tipo_contrato?: string;
  status?: string;
  responsavel_comercial?: string;
  data_inicio_de?: string;
  data_inicio_ate?: string;
  data_vencimento_de?: string;
  data_vencimento_ate?: string;
}

export interface ContratoStats {
  totalContratos: number;
  contratosPorStatus: Record<string, number>;
  contratosPorTipo: Record<string, number>;
  valorTotal: number;
  contratosVencendo: number;
  contratosAtivos: number;
  contratosEncerrados: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

class ContractsService {
  private baseUrl = '/api/contratos';

  /**
   * Buscar todos os contratos com filtros e paginação
   */
  async getAll(
    filters: ContratoFilters = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResponse<Contrato>> {
    const params = new URLSearchParams();
    
    // Adicionar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Adicionar opções de paginação
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await httpClient.get<ApiResponse<PaginatedResponse<Contrato>>>(
      `${this.baseUrl}?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao buscar contratos');
    }

    return {
      data: response.data.data.data,
      pagination: response.data.data.pagination
    };
  }

  /**
   * Buscar contrato por ID
   */
  async getById(id: string): Promise<Contrato> {
    const response = await httpClient.get<ApiResponse<Contrato>>(
      `${this.baseUrl}/${id}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao buscar contrato');
    }

    return response.data.data;
  }

  /**
   * Buscar contrato por número
   */
  async getByNumero(numero: string): Promise<Contrato> {
    const response = await httpClient.get<ApiResponse<Contrato>>(
      `${this.baseUrl}/numero/${numero}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao buscar contrato');
    }

    return response.data.data;
  }

  /**
   * Buscar contratos por cliente
   */
  async getByCliente(
    clienteId: string,
    filters: Partial<ContratoFilters> = {}
  ): Promise<Contrato[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await httpClient.get<ApiResponse<Contrato[]>>(
      `${this.baseUrl}/cliente/${clienteId}?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao buscar contratos do cliente');
    }

    return response.data.data;
  }

  /**
   * Buscar contratos por responsável
   */
  async getByResponsavel(
    responsavelId: string,
    filters: Partial<ContratoFilters> = {}
  ): Promise<Contrato[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await httpClient.get<ApiResponse<Contrato[]>>(
      `${this.baseUrl}/responsavel/${responsavelId}?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao buscar contratos do responsável');
    }

    return response.data.data;
  }

  /**
   * Buscar contratos vencendo
   */
  async getVencendo(dias: number = 30): Promise<Contrato[]> {
    const response = await httpClient.get<ApiResponse<Contrato[]>>(
      `${this.baseUrl}/vencendo?dias=${dias}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao buscar contratos vencendo');
    }

    return response.data.data;
  }

  /**
   * Criar novo contrato
   */
  async create(contratoData: Omit<Contrato, 'id' | 'created_at' | 'updated_at'>): Promise<Contrato> {
    const response = await httpClient.post<ApiResponse<Contrato>>(
      this.baseUrl,
      contratoData
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao criar contrato');
    }

    return response.data.data;
  }

  /**
   * Atualizar contrato
   */
  async update(id: string, updateData: Partial<Contrato>): Promise<Contrato> {
    const response = await httpClient.put<ApiResponse<Contrato>>(
      `${this.baseUrl}/${id}`,
      updateData
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao atualizar contrato');
    }

    return response.data.data;
  }

  /**
   * Deletar contrato
   */
  async delete(id: string): Promise<void> {
    const response = await httpClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao deletar contrato');
    }
  }

  /**
   * Atualizar status do contrato
   */
  async updateStatus(id: string, status: Contrato['status']): Promise<Contrato> {
    const response = await httpClient.patch<ApiResponse<Contrato>>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao atualizar status do contrato');
    }

    return response.data.data;
  }

  /**
   * Obter estatísticas dos contratos
   */
  async getStats(filters: Partial<ContratoFilters> = {}): Promise<ContratoStats> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await httpClient.get<ApiResponse<ContratoStats>>(
      `${this.baseUrl}/stats?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao obter estatísticas');
    }

    return response.data.data;
  }

  /**
   * Busca avançada de contratos
   */
  async search(
    searchParams: ContratoSearchParams,
    options: PaginationOptions = {}
  ): Promise<PaginatedResponse<Contrato>> {
    const params = new URLSearchParams();
    
    // Adicionar parâmetros de busca
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Adicionar opções de paginação
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await httpClient.get<ApiResponse<PaginatedResponse<Contrato>>>(
      `${this.baseUrl}/search?${params.toString()}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro na busca de contratos');
    }

    return {
      data: response.data.data.data,
      pagination: response.data.data.pagination
    };
  }

  /**
   * Verificar se contrato está vencendo
   */
  isVencendo(contrato: Contrato, dias: number = 30): boolean {
    const dataVencimento = new Date(contrato.data_vencimento);
    const hoje = new Date();
    const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    return diasRestantes <= dias && diasRestantes >= 0;
  }

  /**
   * Verificar se contrato está ativo
   */
  isAtivo(contrato: Contrato): boolean {
    return contrato.status === 'ativo';
  }

  /**
   * Calcular dias restantes até vencimento
   */
  getDiasRestantes(contrato: Contrato): number {
    const dataVencimento = new Date(contrato.data_vencimento);
    const hoje = new Date();
    return Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatar status para exibição
   */
  formatStatus(status: Contrato['status']): string {
    const statusMap = {
      rascunho: 'Rascunho',
      ativo: 'Ativo',
      suspenso: 'Suspenso',
      encerrado: 'Encerrado'
    };

    return statusMap[status] || status;
  }

  /**
   * Formatar tipo de contrato para exibição
   */
  formatTipoContrato(tipo: Contrato['tipo_contrato']): string {
    const tipoMap = {
      pf: 'Pessoa Física',
      pj: 'Pessoa Jurídica'
    };

    return tipoMap[tipo] || tipo;
  }

  /**
   * Obter cor do status para UI
   */
  getStatusColor(status: Contrato['status']): string {
    const colorMap = {
      rascunho: 'gray',
      ativo: 'green',
      suspenso: 'yellow',
      encerrado: 'red'
    };

    return colorMap[status] || 'gray';
  }
}

export const contractsService = new ContractsService();