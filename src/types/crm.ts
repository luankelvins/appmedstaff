// Tipos para Formulários de CRM baseados nos contextos fornecidos

export interface Document {
  id: string
  name: string
  type: string
  file?: File
  url?: string
  status: 'pending' | 'received' | 'validated' | 'rejected'
  uploadDate?: string
  notes?: string
}

export interface MandatoryDocument {
  id: string
  name: string
  type: 'aso' | 'comprovante_residencia' | 'documento_identificacao' | 'contrato_trabalho'
  file?: File
  url?: string
  status: 'pending' | 'uploaded' | 'validated' | 'rejected'
  uploadDate?: string
  notes?: string
  required: boolean
}

// Cliente Pessoa Jurídica
export interface ClientePJForm {
  id: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  contato: {
    telefone: string
    email: string
    site?: string
  }
  representanteLegal: {
    nome: string
    cpf: string
    cargo: string
    telefone?: string
    email?: string
  }
  informacoesSocietarias: {
    capitalSocial: number
    tipoSociedade: string
    regimeTributario: string
    atividadePrincipal: string
    atividadesSecundarias: string[]
  }
  certificadoDigital: {
    arquivo: string
    senha: string
    dataVencimento: string
    observacoes: string
  }
  contratos: Array<{
    id: string
    tipo: string
    dataInicio: string
    dataFim: string
    valor: number
    status: 'ativo' | 'inativo' | 'cancelado'
    observacoes: string
  }>
  documentos: Document[]
  vinculos: {
    clientesPF: string[]
    tomadoresServico: string[]
  }
  status: 'ativo' | 'inativo' | 'cancelado'
  observacoes?: string
  dataCadastro: string
  dataUltimaAtualizacao: string
}

// Declaração IRPF
export interface IRPFForm {
  // Dados pessoais
  dadosPessoais: {
    nome: string
    cpf: string
    dataNascimento: string
    telefone: string
    email: string
    endereco: {
      cep: string
      logradouro: string
      numero: string
      complemento?: string
      bairro: string
      cidade: string
      estado: string
    }
  }
  
  // Dependentes
  dependentes: Array<{
    nome: string
    cpf: string
    dataNascimento: string
    grauParentesco: string
    rendimentos?: number
  }>
  
  // Informes de rendimentos
  informesRendimentos: Array<{
    fonte: string
    cnpj: string
    tipo: 'clt' | 'autonomo' | 'previdencia_privada' | 'outros'
    valorTotal: number
    impostoRetido: number
    contribuicaoPrevidenciaria?: number
  }>
  
  // Bens e direitos
  bensEDireitos: Array<{
    codigo: string
    descricao: string
    valorAnterior: number
    valorAtual: number
  }>
  
  // Dívidas e ônus
  dividasEOnus: Array<{
    descricao: string
    valor: number
  }>
  
  // Pagamentos efetuados
  pagamentosEfetuados: {
    saude: number
    educacao: number
    doacoes: number
    previdenciaPrivada: number
  }
  
  // Informações bancárias para restituição
  contaRestituicao: {
    banco: string
    agencia: string
    conta: string
    tipoConta: 'corrente' | 'poupanca'
  }
  
  // Documentos
  documentos: Document[]
  
  // Status
  status: 'rascunho' | 'em_analise' | 'entregue'
  anoExercicio: number
  responsavel: string
  observacoes?: string
}

// Contratos
export interface ContratoForm {
  // Dados do contrato
  numeroContrato: string
  tipoContrato: 'pf' | 'pj'
  clienteId: string
  clienteNome: string
  
  // Validade
  dataInicio: string
  dataVencimento: string
  renovacaoAutomatica: boolean
  
  // Serviços contratados
  servicosContratados: Array<{
    servico: string
    descricao: string
    valor: number
    periodicidade: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'unico'
  }>
  
  // Condições comerciais
  condicoesComerciais: {
    valorTotal: number
    formaPagamento: string
    vencimento: string
    multa?: number
    juros?: number
    desconto?: number
  }
  
  // Cláusulas jurídicas
  clausulasJuridicas: string
  
  // Documentos anexos
  documentos: Document[]
  
  // Status
  status: 'rascunho' | 'ativo' | 'suspenso' | 'encerrado'
  versao: number
  responsavelComercial: string
  responsavelJuridico?: string
  observacoes?: string
}

// Time Interno
export interface TimeInternoForm {
  id?: string
  numeroRegistro?: string // Número único de matrícula
  // Dados pessoais
  dadosPessoais: {
    nome: string
    cpf: string
    rg?: string // Campo não obrigatório
    dataNascimento: string
    estadoCivil: string
    endereco: {
      cep: string
      logradouro: string
      numero: string
      complemento?: string
      bairro: string
      cidade: string
      estado: string
    }
    telefone: string
    emailPessoal: string // Claramente identificado como pessoal
    alergias?: string // Novo campo para alergias
    // Contato de emergência obrigatório
    contatoEmergencia?: {
      nome: string
      telefone: string
      parentesco?: string
      email?: string
    }
  }
  
  // Dados profissionais
  dadosProfissionais: {
    cargo: string
    departamento: string
    gestorResponsavel: string
    dataAdmissao: string
    salario: number
    regime: 'clt' | 'pj' | 'estagiario' | 'terceirizado' | 'rpa'
  }
  
  // Jornada de trabalho
  jornadaTrabalho: {
    escala: string
    cargaHoraria: number
    horarioEntrada: string
    horarioSaida: string
    intervalos: string
  }
  
  // ASO (Atestado de Saúde Ocupacional)
  aso: {
    admissional: {
      data: string
      medico: string
      arquivo?: File
    }
    periodico?: {
      data: string
      medico: string
      proximaData: string
      arquivo?: File
    }
    demissional?: {
      data: string
      medico: string
      questoesSaude?: string // Questões de saúde identificadas
      arquivo?: File
    }
  }
  
  // Dependentes
  dependentes: Array<{
    nome: string
    dataNascimento: string
    grauParentesco: string
    cpf?: string
  }>
  
  // Dados financeiros
  dadosFinanceiros: {
    salarioBase: number
    beneficios: Array<{
      tipo: string
      valor: number
    }>
    dadosBancarios: {
      banco: string
      agencia: string
      conta: string
      tipoConta: 'corrente' | 'poupanca'
      pix: string
    }
  }
  
  // Documentos Obrigatórios
  documentosObrigatorios: MandatoryDocument[]
  
  // Documentos e Anexos
  documentos: Array<{
    id: string
    nome: string
    tipo: string
    arquivo?: File
    url?: string
    data: string
    descricao: string
    categoria: 'contrato' | 'documento_pessoal' | 'certificado' | 'outros'
  }>
  
  // Anexos de Notificações/Atestados
  anexosNotificacoes: Array<{
    id: string
    nome: string
    tipo: string
    arquivo?: File
    url?: string
    data: string
    descricao: string
  }>
  
  // Anexos gerais
  anexos: Array<{
    id: string
    nome: string
    tipo: string
    arquivo?: File
    url?: string
    data: string
    descricao: string
    categoria: 'contrato' | 'documento_pessoal' | 'certificado' | 'outros'
  }>
  observacoesAnexos?: string
  
  // Status// Controle
  status: 'ativo' | 'inativo' | 'afastado' | 'desligado'
  responsavelRH: string
  perfilEditavel?: boolean // Controla se o perfil pode ser editado
  observacoes?: string
  
  // Sistema de Comentários
  comments?: EmployeeComment[]
}

// Serviços Especiais
export interface ServicoEspecialForm {
  // Tipo de serviço
  tipoServico: 'auxilio_moradia' | 'recuperacao_tributaria_pj' | 'restituicao_previdenciaria_pf' | 'alteracao_pj'
  
  // Dados do cliente
  clienteId: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone: string
  
  // Dados específicos por tipo de serviço
  dadosEspecificos: {
    // Auxílio Moradia
    auxilioMoradia?: {
      contratoResidencia: string
      valorAluguel: number
      periodoResidencia: {
        inicio: string
        fim: string
      }
      comprovantesAluguel: Document[]
    }
    
    // Recuperação Tributária PJ
    recuperacaoTributariaPJ?: {
      cnpj: string
      periodoAnalise: {
        inicio: string
        fim: string
      }
      tiposImpostos: string[]
      valorEstimado?: number
      documentosFiscais: Document[]
    }
    
    // Restituição Previdenciária PF
    restituicaoPrevidenciariaPF?: {
      cpf: string
      periodoContribuicao: {
        inicio: string
        fim: string
      }
      tipoContribuicao: string
      valorEstimado?: number
      documentosContribuicao: Document[]
    }
    
    // Alteração PJ
    alteracaoPJ?: {
      cnpj: string
      tipoAlteracao: string[]
      contratoSocialAtual: Document
      documentosSocios: Document[]
    }
  }
  
  // Documentos gerais
  documentos: Document[]
  
  // Status e responsáveis
  status: 'iniciado' | 'documentacao' | 'analise' | 'execucao' | 'concluido'
  responsavelComercial: string
  responsavelOperacional?: string
  dataInicio: string
  previsaoConclusao?: string
  observacoes?: string
}

// Pipeline Comercial
export interface PipelineForm {
  // Identificação
  id: string
  tipo: 'captacao' | 'proposta' | 'contrato' | 'execucao'
  
  // Lead/Cliente
  leadId?: string
  clienteId?: string
  nomeCliente: string
  emailCliente: string
  telefoneCliente: string
  
  // Serviços de interesse
  servicosInteresse: string[]
  
  // Estágio do pipeline
  estagio: 'captacao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechamento' | 'execucao' | 'encerramento'
  
  // Proposta comercial
  propostaComercial?: {
    valorProposto: number
    prazoExecucao: string
    condicoesPagamento: string
    observacoes: string
  }
  
  // Documentos
  documentos: Document[]
  
  // Automações
  proximaAcao: string
  dataProximaAcao: string
  responsavel: string
  
  // Histórico
  historico: Array<{
    data: string
    acao: string
    responsavel: string
    observacoes?: string
  }>
  
  // Status
  status: 'ativo' | 'pausado' | 'ganho' | 'perdido'
  motivoPerdido?: string
  observacoes?: string
}

// Tipos para componentes de formulário
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
  }
}

export interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

// Interfaces para Sistema de Comentários do Membro do Time Interno
export interface EmployeeComment {
  id: string
  employeeId: string
  authorId: string
  authorName: string
  authorRole: string
  type: 'aviso' | 'advertencia' | 'elogio' | 'observacao' | 'atestado' | 'ferias' | 'licenca' | 'treinamento' | 'promocao' | 'outros'
  title: string
  content: string
  isPrivate: boolean // Se apenas RH pode visualizar
  attachments: EmployeeCommentAttachment[]
  createdAt: string
  updatedAt?: string
  editedBy?: string
  tags?: string[]
  priority: 'baixa' | 'media' | 'alta' | 'urgente'
  status: 'ativo' | 'arquivado' | 'resolvido'
  expirationDate?: string // Para avisos temporários
  requiresAcknowledgment?: boolean // Se requer confirmação de leitura do membro do time interno
  acknowledgmentDate?: string
  relatedComments?: string[] // IDs de comentários relacionados
}

export interface EmployeeCommentAttachment {
  id: string
  commentId: string
  name: string
  type: string
  size: number
  file?: File
  url?: string
  uploadDate: string
  uploadedBy: string
  description?: string
  category: 'documento_oficial' | 'atestado_medico' | 'comprovante' | 'foto' | 'outros'
}

export interface CommentFilter {
  type?: EmployeeComment['type'][]
  priority?: EmployeeComment['priority'][]
  status?: EmployeeComment['status'][]
  dateRange?: {
    start: string
    end: string
  }
  author?: string[]
  tags?: string[]
  hasAttachments?: boolean
}

export interface CommentStats {
  total: number
  byType: Record<EmployeeComment['type'], number>
  byPriority: Record<EmployeeComment['priority'], number>
  byStatus: Record<EmployeeComment['status'], number>
  recentCount: number // Últimos 30 dias
}

export interface CRMForm {
  id: string
  title: string
  description: string
  type: 'cliente_pf' | 'cliente_pj' | 'irpf' | 'contrato' | 'time_interno' | 'servico_especial' | 'pipeline'
  sections: FormSection[]
  permissions: {
    create: string[]
    read: string[]
    update: string[]
    delete: string[]
  }
}



// Produtos disponíveis para seleção
// Tipos para Leads e Produtos
export interface ProdutoMedStaff {
  id: string
  nome: string
  descricao: string
  icone: string
  categoria: 'pj' | 'pf' | 'consultoria' | 'assistencia'
  ativo: boolean
}

export interface LeadForm {
  id?: string
  // Dados básicos obrigatórios
  nome: string
  telefone: string
  
  // Dados opcionais
  email?: string
  empresa?: string
  cargo?: string
  cidade?: string
  estado?: string
  
  // Produtos de interesse (seleção múltipla)
  produtosInteresse: string[]
  
  // Origem do lead
  origem: 'site' | 'indicacao' | 'evento' | 'redes_sociais' | 'google' | 'time_interno' | 'outros'
  origemDetalhes?: string
  
  // Observações
  observacoes?: string
  
  // Controle
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
  responsavel?: string
  dataContato?: string
  proximaAcao?: string
  dataProximaAcao?: string
  
  // Metadados
  dataCriacao: string
  dataUltimaAtualizacao?: string
  criadoPor: string
}

export const PRODUTOS_MEDSTAFF: ProdutoMedStaff[] = [
  {
    id: 'abertura-gestao-pj',
    nome: 'Abertura e Gestão de Empresas (PJ)',
    descricao: 'Abertura e gestão completa de empresas pessoa jurídica',
    icone: 'Building2',
    categoria: 'pj',
    ativo: true
  },
  {
    id: 'alteracao-gestao-pj',
    nome: 'Alteração e Gestão de Empresas (PJ)',
    descricao: 'Alterações contratuais e gestão de empresas existentes',
    icone: 'FileEdit',
    categoria: 'pj',
    ativo: true
  },
  {
    id: 'dirpf',
    nome: 'Declaração de Imposto de Renda Pessoa Física (DIRPF)',
    descricao: 'Declaração completa do imposto de renda pessoa física',
    icone: 'FileText',
    categoria: 'pf',
    ativo: true
  },
  {
    id: 'pj-medstaff-15',
    nome: 'PJ MedStaff - 15%',
    descricao: 'Pessoa jurídica com tributação de 15%',
    icone: 'Percent',
    categoria: 'pj',
    ativo: true
  },
  {
    id: 'consultoria-clinicas',
    nome: 'Consultoria para Abertura de Clínicas e Consultórios',
    descricao: 'Consultoria especializada para abertura de estabelecimentos médicos',
    icone: 'Stethoscope',
    categoria: 'consultoria',
    ativo: true
  },
  {
    id: 'planejamento-financeiro-pf',
    nome: 'Planejamento Financeiro para Pessoa Física',
    descricao: 'Planejamento financeiro personalizado',
    icone: 'TrendingUp',
    categoria: 'pf',
    ativo: true
  },
  {
    id: 'auxilio-moradia',
    nome: 'Auxílio Moradia de Residência Médica',
    descricao: 'Auxílio para moradia durante residência médica',
    icone: 'Home',
    categoria: 'assistencia',
    ativo: true
  },
  {
    id: 'equiparacao-hospitalar',
    nome: 'Equiparação Hospitalar',
    descricao: 'Serviços de equiparação hospitalar',
    icone: 'Hospital',
    categoria: 'consultoria',
    ativo: true
  },
  {
    id: 'recuperacao-tributaria-pj',
    nome: 'Recuperação Tributária Pessoa Jurídica',
    descricao: 'Recuperação de tributos pagos indevidamente por PJ',
    icone: 'RefreshCw',
    categoria: 'pj',
    ativo: true
  },
  {
    id: 'restituicao-previdenciaria-pf',
    nome: 'Restituição Previdenciária de Pessoa Física',
    descricao: 'Restituição de contribuições previdenciárias',
    icone: 'Shield',
    categoria: 'pf',
    ativo: true
  },
  {
    id: 'medassist',
    nome: 'MedAssist',
    descricao: 'Assistência completa para profissionais da saúde',
    icone: 'HeartHandshake',
    categoria: 'assistencia',
    ativo: true
  }
]

// Estados brasileiros para seleção
export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

// Tipos para o Pipeline de Leads
export type LeadPipelineStage = 
  | 'novo_lead'
  | 'ligacao_1'
  | 'ligacao_2'
  | 'mensagem'
  | 'recontato'
  | 'desfecho'

export type LeadStatus = 
  | 'qualificado'
  | 'nao_qualificado'
  | 'nao_definido'

export type TaskStatus = 
  | 'pendente'
  | 'em_andamento'
  | 'concluida'
  | 'vencida'
  | 'cancelada'

export type ContactAttemptType = 
  | 'ligacao'
  | 'whatsapp'
  | 'email'
  | 'presencial'

export type ContactAttemptResult = 
  | 'sucesso'
  | 'sem_resposta'
  | 'ocupado'
  | 'numero_invalido'
  | 'nao_atende'
  | 'reagendar'

export interface LeadPipelineCard {
  id: string
  leadId: string
  leadData: LeadForm
  currentStage: LeadPipelineStage
  status: LeadStatus
  responsavelAtual: string
  responsavelAnterior?: string
  dataDistribuicao: Date
  dataUltimaAtualizacao: Date
  tempoNoEstagio: number // em horas
  tempoTotalPipeline: number // em horas
  
  // Histórico de etapas
  stageHistory: Array<{
    stage: LeadPipelineStage
    responsavel: string
    dataInicio: Date
    dataFim?: Date
    tempoNoEstagio?: number
    observacoes?: string
  }>
  
  // Tentativas de contato
  contactAttempts: ContactAttempt[]
  
  // Tarefas associadas
  tasks: LeadTask[]
  
  // Reagendamentos
  scheduledRecontact?: {
    dataRecontato: Date
    motivo: string
    observacoes?: string
  }
  
  // Desfecho final
  outcome?: {
    qualificacao: 'qualificado' | 'nao_qualificado'
    motivo: string
    observacoes?: string
    dataDesfecho: Date
    responsavelDesfecho: string
  }
  
  observacoes?: string
  criadoPor: string
  dataCriacao: Date
}

export interface ContactAttempt {
  id: string
  leadPipelineId: string
  tipo: ContactAttemptType
  resultado: ContactAttemptResult
  dataContato: Date
  responsavel: string
  duracao?: number // em minutos para ligações
  observacoes?: string
  proximaAcao?: string
  dataProximaAcao?: Date
}

export interface LeadTask {
  id: string
  leadPipelineId: string
  titulo: string
  descricao: string
  tipo: 'contato_inicial' | 'follow_up' | 'reagendamento' | 'qualificacao' | 'custom'
  status: TaskStatus
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  responsavel: string
  dataVencimento: Date
  dataCriacao: Date
  dataConclusao?: Date
  observacoes?: string
  taskDatabaseId?: string // ID da tarefa no banco de dados
  
  // Auto-redistribuição
  tentativasRedistribuicao: number
  maxTentativasRedistribuicao: number
  
  // Notificações
  notificacoes: Array<{
    tipo: 'criacao' | 'vencimento' | 'redistribuicao'
    destinatario: string
    dataEnvio: Date
    lida: boolean
  }>
}

export interface LeadDistribution {
  id: string
  leadId: string
  responsavelAtual: string
  responsavelAnterior?: string
  motivo: 'distribuicao_inicial' | 'redistribuicao_timeout' | 'redistribuicao_manual'
  dataDistribuicao: Date
  observacoes?: string
}

export interface CommercialTeamMember {
  id: string
  nome: string
  email: string
  cargo: string
  departamento: string
  ativo: boolean
  capacidadeLeads: number // máximo de leads simultâneos
  leadsAtivos: number // leads atualmente atribuídos
  prioridade: number // ordem na fila de distribuição (1 = maior prioridade)
  especialidades: string[] // produtos/serviços de especialidade
}

export interface LeadPipelineStats {
  totalLeads: number
  leadsPorEstagio: Record<LeadPipelineStage, number>
  leadsPorStatus: Record<LeadStatus, number>
  tempoMedioPorEstagio: Record<LeadPipelineStage, number>
  tempoMedioTotal: number
  taxaConversao: {
    novoParaContato: number
    contatoParaQualificado: number
    qualificadoParaGanho: number
    geral: number
  }
  leadsPorResponsavel: Record<string, {
    total: number
    qualificados: number
    perdidos: number
    tempoMedio: number
  }>
  tarefasVencidas: number
  leadsSemContato24h: number
  leadsParaRecontato: number
}

export interface LeadPipelineConfig {
  tempoLimiteContato: number // em horas
  tempoRecontato: number // em dias
  maxTentativasRedistribuicao: number
  notificarDiretorComercial: boolean
  emailDiretorComercial: string
  distribuicaoAutomatica: boolean
  horarioComercial: {
    inicio: string
    fim: string
    diasSemana: number[] // 0-6 (domingo-sábado)
  }
}