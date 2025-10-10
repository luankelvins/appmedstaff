import Contrato from '../models/Contrato.js';
import { logger } from '../config/logger.js';

class ContratoService {
  /**
   * Buscar todos os contratos com filtros e paginação
   */
  async findAll(filters = {}, options = {}) {
    try {
      logger.info('Buscando contratos', { filters, options });
      
      const result = await Contrato.findAll(filters, options);
      
      logger.info('Contratos encontrados', { 
        total: result.total, 
        page: options.page,
        limit: options.limit 
      });
      
      return result;
    } catch (error) {
      logger.error('Erro ao buscar contratos:', error);
      throw error;
    }
  }

  /**
   * Buscar contrato por ID
   */
  async findById(id) {
    try {
      logger.info('Buscando contrato por ID', { id });
      
      const contrato = await Contrato.findById(id);
      
      if (!contrato) {
        logger.warn('Contrato não encontrado', { id });
        return null;
      }
      
      logger.info('Contrato encontrado', { id, numero: contrato.numero_contrato });
      return contrato;
    } catch (error) {
      logger.error('Erro ao buscar contrato por ID:', error);
      throw error;
    }
  }

  /**
   * Buscar contrato por número
   */
  async findByNumero(numero) {
    try {
      logger.info('Buscando contrato por número', { numero });
      
      const contrato = await Contrato.findByNumero(numero);
      
      if (!contrato) {
        logger.warn('Contrato não encontrado', { numero });
        return null;
      }
      
      logger.info('Contrato encontrado', { numero, id: contrato.id });
      return contrato;
    } catch (error) {
      logger.error('Erro ao buscar contrato por número:', error);
      throw error;
    }
  }

  /**
   * Buscar contratos por cliente
   */
  async findByCliente(clienteId, filters = {}) {
    try {
      logger.info('Buscando contratos por cliente', { clienteId, filters });
      
      const contratos = await Contrato.findByCliente(clienteId, filters);
      
      logger.info('Contratos do cliente encontrados', { 
        clienteId, 
        total: contratos.length 
      });
      
      return contratos;
    } catch (error) {
      logger.error('Erro ao buscar contratos por cliente:', error);
      throw error;
    }
  }

  /**
   * Buscar contratos por responsável
   */
  async findByResponsavel(responsavelId, filters = {}) {
    try {
      logger.info('Buscando contratos por responsável', { responsavelId, filters });
      
      const contratos = await Contrato.findByResponsavel(responsavelId, filters);
      
      logger.info('Contratos do responsável encontrados', { 
        responsavelId, 
        total: contratos.length 
      });
      
      return contratos;
    } catch (error) {
      logger.error('Erro ao buscar contratos por responsável:', error);
      throw error;
    }
  }

  /**
   * Buscar contratos vencendo
   */
  async findVencendo(dias = 30) {
    try {
      logger.info('Buscando contratos vencendo', { dias });
      
      const contratos = await Contrato.findVencendo(dias);
      
      logger.info('Contratos vencendo encontrados', { 
        dias, 
        total: contratos.length 
      });
      
      return contratos;
    } catch (error) {
      logger.error('Erro ao buscar contratos vencendo:', error);
      throw error;
    }
  }

  /**
   * Criar novo contrato
   */
  async create(contratoData) {
    try {
      logger.info('Criando novo contrato', { 
        numero: contratoData.numero_contrato,
        cliente: contratoData.cliente_nome 
      });
      
      // Validar se número já existe
      const existingContrato = await Contrato.findByNumero(contratoData.numero_contrato);
      if (existingContrato) {
        const error = new Error('Número de contrato já está em uso');
        error.code = 'DUPLICATE_CONTRACT_NUMBER';
        throw error;
      }

      // Validar datas
      if (new Date(contratoData.data_inicio) >= new Date(contratoData.data_vencimento)) {
        const error = new Error('Data de vencimento deve ser posterior à data de início');
        error.code = 'INVALID_DATES';
        throw error;
      }

      const contrato = await Contrato.create(contratoData);
      
      logger.info('Contrato criado com sucesso', { 
        id: contrato.id,
        numero: contrato.numero_contrato 
      });
      
      return contrato;
    } catch (error) {
      logger.error('Erro ao criar contrato:', error);
      throw error;
    }
  }

  /**
   * Atualizar contrato
   */
  async update(id, updateData) {
    try {
      logger.info('Atualizando contrato', { id, updateData });
      
      const contrato = await Contrato.findById(id);
      if (!contrato) {
        const error = new Error('Contrato não encontrado');
        error.code = 'CONTRACT_NOT_FOUND';
        throw error;
      }

      // Validar número único (se estiver sendo alterado)
      if (updateData.numero_contrato && updateData.numero_contrato !== contrato.numero_contrato) {
        const existingContrato = await Contrato.findByNumero(updateData.numero_contrato);
        if (existingContrato) {
          const error = new Error('Número de contrato já está em uso');
          error.code = 'DUPLICATE_CONTRACT_NUMBER';
          throw error;
        }
      }

      // Validar datas (se estiverem sendo alteradas)
      const dataInicio = updateData.data_inicio || contrato.data_inicio;
      const dataVencimento = updateData.data_vencimento || contrato.data_vencimento;
      
      if (new Date(dataInicio) >= new Date(dataVencimento)) {
        const error = new Error('Data de vencimento deve ser posterior à data de início');
        error.code = 'INVALID_DATES';
        throw error;
      }

      await contrato.update(updateData);
      
      logger.info('Contrato atualizado com sucesso', { 
        id: contrato.id,
        numero: contrato.numero_contrato 
      });
      
      return contrato;
    } catch (error) {
      logger.error('Erro ao atualizar contrato:', error);
      throw error;
    }
  }

  /**
   * Deletar contrato
   */
  async delete(id) {
    try {
      logger.info('Deletando contrato', { id });
      
      const contrato = await Contrato.findById(id);
      if (!contrato) {
        const error = new Error('Contrato não encontrado');
        error.code = 'CONTRACT_NOT_FOUND';
        throw error;
      }

      await contrato.delete();
      
      logger.info('Contrato deletado com sucesso', { 
        id,
        numero: contrato.numero_contrato 
      });
      
      return true;
    } catch (error) {
      logger.error('Erro ao deletar contrato:', error);
      throw error;
    }
  }

  /**
   * Atualizar status do contrato
   */
  async updateStatus(id, status) {
    try {
      logger.info('Atualizando status do contrato', { id, status });
      
      const contrato = await Contrato.findById(id);
      if (!contrato) {
        const error = new Error('Contrato não encontrado');
        error.code = 'CONTRACT_NOT_FOUND';
        throw error;
      }

      const validStatuses = ['rascunho', 'ativo', 'suspenso', 'encerrado'];
      if (!validStatuses.includes(status)) {
        const error = new Error('Status inválido');
        error.code = 'INVALID_STATUS';
        throw error;
      }

      await contrato.update({ status });
      
      logger.info('Status do contrato atualizado com sucesso', { 
        id,
        numero: contrato.numero_contrato,
        status 
      });
      
      return contrato;
    } catch (error) {
      logger.error('Erro ao atualizar status do contrato:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas dos contratos
   */
  async getStats(filters = {}) {
    try {
      logger.info('Obtendo estatísticas dos contratos', { filters });
      
      const stats = await Contrato.getStats(filters);
      
      logger.info('Estatísticas obtidas com sucesso', { 
        totalContratos: stats.totalContratos 
      });
      
      return stats;
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca avançada de contratos
   */
  async search(searchParams, options = {}) {
    try {
      logger.info('Realizando busca avançada de contratos', { searchParams, options });
      
      // Construir filtros para o método findAll
      const filters = {};
      if (searchParams.q) filters.search = searchParams.q;
      if (searchParams.tipo_contrato) filters.tipo_contrato = searchParams.tipo_contrato;
      if (searchParams.status) filters.status = searchParams.status;
      if (searchParams.responsavel_comercial) filters.responsavel_comercial = searchParams.responsavel_comercial;
      if (searchParams.data_inicio_de) filters.data_inicio = searchParams.data_inicio_de;
      if (searchParams.data_vencimento_ate) filters.data_fim = searchParams.data_vencimento_ate;

      const result = await Contrato.findAll(filters, options);
      
      logger.info('Busca avançada concluída', { 
        total: result.total,
        filtros: Object.keys(filters).length 
      });
      
      return result;
    } catch (error) {
      logger.error('Erro na busca avançada:', error);
      throw error;
    }
  }

  /**
   * Verificar se contrato está vencendo
   */
  async isVencendo(id, dias = 30) {
    try {
      const contrato = await this.findById(id);
      if (!contrato) {
        return false;
      }

      const dataVencimento = new Date(contrato.data_vencimento);
      const hoje = new Date();
      const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

      return diasRestantes <= dias && diasRestantes >= 0;
    } catch (error) {
      logger.error('Erro ao verificar vencimento:', error);
      throw error;
    }
  }

  /**
   * Verificar se contrato está ativo
   */
  async isAtivo(id) {
    try {
      const contrato = await this.findById(id);
      if (!contrato) {
        return false;
      }

      return contrato.status === 'ativo';
    } catch (error) {
      logger.error('Erro ao verificar se contrato está ativo:', error);
      throw error;
    }
  }

  /**
   * Obter valor total dos contratos
   */
  async getValorTotal(filters = {}) {
    try {
      const stats = await this.getStats(filters);
      return stats.valorTotal || 0;
    } catch (error) {
      logger.error('Erro ao obter valor total:', error);
      throw error;
    }
  }
}

export default new ContratoService();