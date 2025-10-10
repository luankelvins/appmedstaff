import { body, param, query } from 'express-validator';

// ==================== VALIDAÇÕES COMUNS ====================
export const commonValidations = {
  id: param('id').isUUID().withMessage('ID deve ser um UUID válido'),
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
    query('sortBy').optional().isString().withMessage('Campo de ordenação deve ser uma string'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Ordem deve ser "asc" ou "desc"')
  ],
  
  search: query('search').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Busca deve ter entre 1 e 100 caracteres'),
  
  status: body('status').optional().isIn(['ativo', 'inativo', 'suspenso']).withMessage('Status deve ser: ativo, inativo ou suspenso'),
  
  dateRange: [
    query('dataInicio').optional().isISO8601().withMessage('Data de início deve estar no formato ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data de fim deve estar no formato ISO8601')
  ]
};

// ==================== VALIDAÇÕES DE FUNCIONÁRIOS ====================
export const employeeValidations = {
  create: [
    body('dados_pessoais.nome').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('dados_pessoais.cpf').notEmpty().matches(/^\d{11}$/).withMessage('CPF deve conter exatamente 11 dígitos'),
    body('dados_pessoais.email').isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('dados_pessoais.telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('dados_pessoais.data_nascimento').optional().isISO8601().withMessage('Data de nascimento deve estar no formato ISO8601'),
    body('dados_pessoais.endereco.cep').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato XXXXX-XXX'),
    body('dados_profissionais.cargo').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Cargo deve ter entre 2 e 100 caracteres'),
    body('dados_profissionais.departamento').notEmpty().trim().isLength({ min: 2, max: 50 }).withMessage('Departamento deve ter entre 2 e 50 caracteres'),
    body('dados_profissionais.data_admissao').isISO8601().withMessage('Data de admissão deve estar no formato ISO8601'),
    body('dados_profissionais.salario').optional().isFloat({ min: 0 }).withMessage('Salário deve ser um número positivo'),
    body('role').optional().isIn(['user', 'analista_rh', 'gerente_rh', 'analista_comercial', 'gerente_comercial', 'admin', 'superadmin']).withMessage('Role inválido'),
    body('password').isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
  ],
  
  update: [
    commonValidations.id,
    body('dados_pessoais.nome').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('dados_pessoais.email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('dados_pessoais.telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('dados_profissionais.cargo').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Cargo deve ter entre 2 e 100 caracteres'),
    body('dados_profissionais.departamento').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Departamento deve ter entre 2 e 50 caracteres'),
    body('dados_profissionais.salario').optional().isFloat({ min: 0 }).withMessage('Salário deve ser um número positivo')
  ],
  
  updateStatus: [
    commonValidations.id,
    commonValidations.status
  ]
};

// ==================== VALIDAÇÕES DE TAREFAS ====================
export const taskValidations = {
  create: [
    body('titulo').notEmpty().trim().isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
    body('descricao').optional().trim().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
    body('status').optional().isIn(['pendente', 'em_andamento', 'concluida', 'cancelada']).withMessage('Status inválido'),
    body('prioridade').optional().isIn(['baixa', 'media', 'alta', 'urgente']).withMessage('Prioridade inválida'),
    body('data_vencimento').optional().isISO8601().withMessage('Data de vencimento deve estar no formato ISO8601'),
    body('usuario_criador_id').isUUID().withMessage('ID do usuário criador deve ser um UUID válido'),
    body('usuario_responsavel_id').optional().isUUID().withMessage('ID do usuário responsável deve ser um UUID válido'),
    body('categoria').optional().trim().isLength({ max: 50 }).withMessage('Categoria deve ter no máximo 50 caracteres'),
    body('tags').optional().isArray().withMessage('Tags devem ser um array'),
    body('tags.*').optional().trim().isLength({ min: 1, max: 30 }).withMessage('Cada tag deve ter entre 1 e 30 caracteres')
  ],
  
  update: [
    commonValidations.id,
    body('titulo').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
    body('descricao').optional().trim().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
    body('status').optional().isIn(['pendente', 'em_andamento', 'concluida', 'cancelada']).withMessage('Status inválido'),
    body('prioridade').optional().isIn(['baixa', 'media', 'alta', 'urgente']).withMessage('Prioridade inválida'),
    body('data_vencimento').optional().isISO8601().withMessage('Data de vencimento deve estar no formato ISO8601'),
    body('usuario_responsavel_id').optional().isUUID().withMessage('ID do usuário responsável deve ser um UUID válido')
  ],
  
  updateStatus: [
    commonValidations.id,
    body('status').isIn(['pendente', 'em_andamento', 'concluida', 'cancelada']).withMessage('Status inválido')
  ]
};

// ==================== VALIDAÇÕES DE LEADS ====================
export const leadValidations = {
  create: [
    body('nome').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('empresa').optional().trim().isLength({ max: 100 }).withMessage('Empresa deve ter no máximo 100 caracteres'),
    body('cargo').optional().trim().isLength({ max: 100 }).withMessage('Cargo deve ter no máximo 100 caracteres'),
    body('status').optional().isIn(['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido']).withMessage('Status inválido'),
    body('origem').optional().trim().isLength({ max: 50 }).withMessage('Origem deve ter no máximo 50 caracteres'),
    body('valor_estimado').optional().isFloat({ min: 0 }).withMessage('Valor estimado deve ser um número positivo'),
    body('probabilidade').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidade deve ser entre 0 e 100'),
    body('data_contato').optional().isISO8601().withMessage('Data de contato deve estar no formato ISO8601'),
    body('proxima_acao').optional().isISO8601().withMessage('Próxima ação deve estar no formato ISO8601'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido'),
    body('observacoes').optional().trim().isLength({ max: 1000 }).withMessage('Observações devem ter no máximo 1000 caracteres')
  ],
  
  update: [
    commonValidations.id,
    body('nome').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('status').optional().isIn(['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido']).withMessage('Status inválido'),
    body('valor_estimado').optional().isFloat({ min: 0 }).withMessage('Valor estimado deve ser um número positivo'),
    body('probabilidade').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidade deve ser entre 0 e 100'),
    body('proxima_acao').optional().isISO8601().withMessage('Próxima ação deve estar no formato ISO8601'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ],
  
  updateStatus: [
    commonValidations.id,
    body('status').isIn(['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido']).withMessage('Status inválido')
  ]
};

// ==================== VALIDAÇÕES DE CLIENTES PF ====================
export const clientePFValidations = {
  create: [
    body('nome').notEmpty().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('cpf').notEmpty().matches(/^\d{11}$/).withMessage('CPF deve conter exatamente 11 dígitos'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('data_nascimento').optional().isISO8601().withMessage('Data de nascimento deve estar no formato ISO8601'),
    body('endereco.cep').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato XXXXX-XXX'),
    body('endereco.logradouro').optional().trim().isLength({ max: 200 }).withMessage('Logradouro deve ter no máximo 200 caracteres'),
    body('endereco.numero').optional().trim().isLength({ max: 20 }).withMessage('Número deve ter no máximo 20 caracteres'),
    body('endereco.cidade').optional().trim().isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres'),
    body('endereco.estado').optional().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter exatamente 2 caracteres'),
    body('profissao').optional().trim().isLength({ max: 100 }).withMessage('Profissão deve ter no máximo 100 caracteres'),
    body('renda_mensal').optional().isFloat({ min: 0 }).withMessage('Renda mensal deve ser um número positivo'),
    body('estado_civil').optional().isIn(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).withMessage('Estado civil inválido'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ],
  
  update: [
    commonValidations.id,
    body('nome').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('profissao').optional().trim().isLength({ max: 100 }).withMessage('Profissão deve ter no máximo 100 caracteres'),
    body('renda_mensal').optional().isFloat({ min: 0 }).withMessage('Renda mensal deve ser um número positivo'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ]
};

// ==================== VALIDAÇÕES DE CLIENTES PJ ====================
export const clientePJValidations = {
  create: [
    body('razao_social').notEmpty().trim().isLength({ min: 2, max: 200 }).withMessage('Razão social deve ter entre 2 e 200 caracteres'),
    body('cnpj').notEmpty().matches(/^\d{14}$/).withMessage('CNPJ deve conter exatamente 14 dígitos'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('endereco.cep').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato XXXXX-XXX'),
    body('regime_tributario').optional().isIn(['simples_nacional', 'lucro_presumido', 'lucro_real']).withMessage('Regime tributário inválido'),
    body('porte_empresa').optional().isIn(['mei', 'micro', 'pequena', 'media', 'grande']).withMessage('Porte da empresa inválido'),
    body('atividade_principal').optional().trim().isLength({ max: 200 }).withMessage('Atividade principal deve ter no máximo 200 caracteres'),
    body('representante_legal').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Representante legal deve ter entre 2 e 100 caracteres'),
    body('cpf_representante').optional().matches(/^\d{11}$/).withMessage('CPF do representante deve conter exatamente 11 dígitos'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ],
  
  update: [
    commonValidations.id,
    body('razao_social').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Razão social deve ter entre 2 e 200 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('telefone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
    body('regime_tributario').optional().isIn(['simples_nacional', 'lucro_presumido', 'lucro_real']).withMessage('Regime tributário inválido'),
    body('porte_empresa').optional().isIn(['mei', 'micro', 'pequena', 'media', 'grande']).withMessage('Porte da empresa inválido'),
    body('representante_legal').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Representante legal deve ter entre 2 e 100 caracteres'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ]
};

// ==================== VALIDAÇÕES DE NOTIFICAÇÕES ====================
export const notificationValidations = {
  create: [
    body('usuario_id').isUUID().withMessage('ID do usuário deve ser um UUID válido'),
    body('titulo').notEmpty().trim().isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
    body('mensagem').notEmpty().trim().isLength({ min: 10, max: 1000 }).withMessage('Mensagem deve ter entre 10 e 1000 caracteres'),
    body('tipo').optional().isIn(['info', 'sucesso', 'aviso', 'erro']).withMessage('Tipo inválido'),
    body('categoria').optional().trim().isLength({ max: 50 }).withMessage('Categoria deve ter no máximo 50 caracteres'),
    body('link').optional().isURL().withMessage('Link deve ser uma URL válida'),
    body('data_expiracao').optional().isISO8601().withMessage('Data de expiração deve estar no formato ISO8601'),
    body('prioridade').optional().isIn(['baixa', 'media', 'alta']).withMessage('Prioridade inválida')
  ],
  
  createMultiple: [
    body('notifications').isArray({ min: 1 }).withMessage('Deve ser um array com pelo menos uma notificação'),
    body('notifications.*.usuario_id').isUUID().withMessage('ID do usuário deve ser um UUID válido'),
    body('notifications.*.titulo').notEmpty().trim().isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
    body('notifications.*.mensagem').notEmpty().trim().isLength({ min: 10, max: 1000 }).withMessage('Mensagem deve ter entre 10 e 1000 caracteres')
  ]
};

// ==================== VALIDAÇÕES DE DESPESAS ====================
export const expenseValidations = {
  create: [
    body('descricao').notEmpty().trim().isLength({ min: 3, max: 200 }).withMessage('Descrição deve ter entre 3 e 200 caracteres'),
    body('valor').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
    body('data_vencimento').isISO8601().withMessage('Data de vencimento deve estar no formato ISO8601'),
    body('categoria_id').optional().isUUID().withMessage('ID da categoria deve ser um UUID válido'),
    body('fornecedor').optional().trim().isLength({ max: 100 }).withMessage('Fornecedor deve ter no máximo 100 caracteres'),
    body('numero_documento').optional().trim().isLength({ max: 50 }).withMessage('Número do documento deve ter no máximo 50 caracteres'),
    body('centro_custo').optional().trim().isLength({ max: 50 }).withMessage('Centro de custo deve ter no máximo 50 caracteres'),
    body('recorrente').optional().isBoolean().withMessage('Recorrente deve ser um valor booleano'),
    body('frequencia_recorrencia').optional().isIn(['mensal', 'bimestral', 'trimestral', 'semestral', 'anual']).withMessage('Frequência de recorrência inválida'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ],
  
  update: [
    commonValidations.id,
    body('descricao').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Descrição deve ter entre 3 e 200 caracteres'),
    body('valor').optional().isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
    body('data_vencimento').optional().isISO8601().withMessage('Data de vencimento deve estar no formato ISO8601'),
    body('fornecedor').optional().trim().isLength({ max: 100 }).withMessage('Fornecedor deve ter no máximo 100 caracteres'),
    body('centro_custo').optional().trim().isLength({ max: 50 }).withMessage('Centro de custo deve ter no máximo 50 caracteres'),
    body('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido')
  ],
  
  markAsPaid: [
    commonValidations.id,
    body('valor_pago').isFloat({ min: 0.01 }).withMessage('Valor pago deve ser maior que zero'),
    body('data_pagamento').isISO8601().withMessage('Data de pagamento deve estar no formato ISO8601'),
    body('forma_pagamento').optional().trim().isLength({ max: 50 }).withMessage('Forma de pagamento deve ter no máximo 50 caracteres'),
    body('conta_bancaria_id').optional().isUUID().withMessage('ID da conta bancária deve ser um UUID válido')
  ]
};

// ==================== VALIDAÇÕES DE FILTROS ====================
export const filterValidations = {
  employees: [
    ...commonValidations.pagination,
    query('departamento').optional().trim().isLength({ max: 50 }).withMessage('Departamento deve ter no máximo 50 caracteres'),
    query('cargo').optional().trim().isLength({ max: 100 }).withMessage('Cargo deve ter no máximo 100 caracteres'),
    query('status').optional().isIn(['ativo', 'inativo', 'suspenso']).withMessage('Status inválido')
  ],
  
  tasks: [
    ...commonValidations.pagination,
    query('status').optional().isIn(['pendente', 'em_andamento', 'concluida', 'cancelada']).withMessage('Status inválido'),
    query('prioridade').optional().isIn(['baixa', 'media', 'alta', 'urgente']).withMessage('Prioridade inválida'),
    query('categoria').optional().trim().isLength({ max: 50 }).withMessage('Categoria deve ter no máximo 50 caracteres'),
    query('usuario_responsavel_id').optional().isUUID().withMessage('ID do usuário responsável deve ser um UUID válido')
  ],
  
  leads: [
    ...commonValidations.pagination,
    query('status').optional().isIn(['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido']).withMessage('Status inválido'),
    query('origem').optional().trim().isLength({ max: 50 }).withMessage('Origem deve ter no máximo 50 caracteres'),
    query('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido'),
    query('valor_min').optional().isFloat({ min: 0 }).withMessage('Valor mínimo deve ser um número positivo'),
    query('valor_max').optional().isFloat({ min: 0 }).withMessage('Valor máximo deve ser um número positivo'),
    query('probabilidade_min').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidade mínima deve ser entre 0 e 100'),
    query('probabilidade_max').optional().isInt({ min: 0, max: 100 }).withMessage('Probabilidade máxima deve ser entre 0 e 100')
  ],
  
  expenses: [
    ...commonValidations.pagination,
    query('status').optional().isIn(['pendente', 'pago', 'vencido', 'cancelado']).withMessage('Status inválido'),
    query('categoria_id').optional().isUUID().withMessage('ID da categoria deve ser um UUID válido'),
    query('fornecedor').optional().trim().isLength({ max: 100 }).withMessage('Fornecedor deve ter no máximo 100 caracteres'),
    query('responsavel_id').optional().isUUID().withMessage('ID do responsável deve ser um UUID válido'),
    query('valor_min').optional().isFloat({ min: 0 }).withMessage('Valor mínimo deve ser um número positivo'),
    query('valor_max').optional().isFloat({ min: 0 }).withMessage('Valor máximo deve ser um número positivo')
  ]
};

export default {
  commonValidations,
  employeeValidations,
  taskValidations,
  leadValidations,
  clientePFValidations,
  clientePJValidations,
  notificationValidations,
  expenseValidations,
  filterValidations
};