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

// Cliente Pessoa Física
export interface ClientePFForm {
  // Informações Pessoais
  nome: string
  cpf: string
  rg?: string
  dataNascimento?: string
  estadoCivil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel'
  telefone?: string
  email?: string
  
  // Endereço
  endereco: {
    cep?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
  }
  
  // Dados Profissionais
  profissao?: string
  conselhoClasse?: string
  numeroConselho?: string
  
  // Dados Bancários
  dadosBancarios: {
    banco?: string
    agencia?: string
    conta?: string
    tipoConta?: 'corrente' | 'poupanca'
    pix?: string
  }
  
  // Certificado Digital
  certificadoDigital: {
    arquivo?: string
    senha?: string
    dataVencimento?: string
  }
  
  // Vínculos Empregatícios
  vinculos: Array<{
    id: string
    tipo: 'pj' | 'tomador'
    empresa: string
    cargo: string
    dataInicio: string
    dataFim?: string
    ativo: boolean
  }>
  
  // Controle
  responsavel: string
  status: 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado' | 'ativo'
  observacoes?: string
  documentos: Document[]
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
  
  // Status
  status: 'ativo' | 'inativo' | 'afastado' | 'desligado'
  responsavelRH: string
  perfilEditavel?: boolean // Controla se o perfil pode ser editado
  observacoes?: string
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