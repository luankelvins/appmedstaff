// Tipos para o banco de dados PostgreSQL

export interface Employee {
  id: string;
  email: string;
  nome: string;
  cpf: string;
  telefone?: string;
  endereco?: any; // JSONB
  dados_profissionais?: any; // JSONB
  dados_financeiros?: any; // JSONB
  status: 'ativo' | 'inativo' | 'suspenso';
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  responsavel_id?: string;
  criado_por: string;
  data_vencimento?: Date;
  data_conclusao?: Date;
  tags?: string[];
  anexos?: any; // JSONB
  created_at: Date;
  updated_at: Date;
}

export interface Contrato {
  id: string;
  funcionario_id: string;
  tipo_contrato: 'clt' | 'pj' | 'estagio' | 'terceirizado';
  data_inicio: Date;
  data_fim?: Date;
  salario_base: number;
  beneficios?: any; // JSONB
  clausulas?: any; // JSONB
  status: 'ativo' | 'inativo' | 'suspenso' | 'rescindido';
  created_at: Date;
  updated_at: Date;
}

export interface IRPF {
  id: string;
  funcionario_id: string;
  ano_calendario: number;
  rendimentos_tributaveis: number;
  rendimentos_isentos: number;
  deducoes: any; // JSONB
  imposto_devido: number;
  imposto_retido: number;
  imposto_pagar: number;
  status: 'pendente' | 'processado' | 'enviado' | 'erro';
  data_processamento?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string;
  funcionario_id: string;
  categoria_id: string;
  descricao: string;
  valor: number;
  data_despesa: Date;
  comprovante_url?: string;
  observacoes?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'paga';
  aprovado_por?: string;
  data_aprovacao?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialCategory {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao?: string;
  cor?: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentMethod {
  id: string;
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto';
  descricao?: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BankAccount {
  id: string;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'corrente' | 'poupanca' | 'salario';
  saldo_atual: number;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SystemSetting {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  categoria: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminDocument {
  id: string;
  nome: string;
  tipo: 'politica' | 'procedimento' | 'manual' | 'contrato' | 'outro';
  categoria: string;
  descricao?: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  arquivo_tamanho?: number;
  versao: string;
  status: 'rascunho' | 'ativo' | 'arquivado';
  tags?: string[];
  criado_por: string;
  aprovado_por?: string;
  data_aprovacao?: Date;
  data_validade?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AdminReport {
  id: string;
  nome: string;
  tipo_relatorio: 'funcionarios' | 'tarefas' | 'financeiro' | 'contratos' | 'personalizado';
  descricao?: string;
  configuracao: any; // JSONB
  agendamento?: any; // JSONB
  destinatarios?: string[];
  formato: 'pdf' | 'excel' | 'csv';
  status: 'ativo' | 'inativo';
  criado_por: string;
  ultima_execucao?: Date;
  proxima_execucao?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  tabela: string;
  operacao: 'INSERT' | 'UPDATE' | 'DELETE';
  registro_id: string;
  dados_antigos?: any; // JSONB
  dados_novos?: any; // JSONB
  usuario_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Tipos para inserção (sem campos auto-gerados)
export type EmployeeInsert = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type ContratoInsert = Omit<Contrato, 'id' | 'created_at' | 'updated_at'>;
export type IRPFInsert = Omit<IRPF, 'id' | 'created_at' | 'updated_at'>;
export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;

// Tipos para atualização (todos os campos opcionais exceto id)
export type EmployeeUpdate = Partial<Omit<Employee, 'id' | 'created_at'>> & { updated_at?: Date };
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at'>> & { updated_at?: Date };
export type ContratoUpdate = Partial<Omit<Contrato, 'id' | 'created_at'>> & { updated_at?: Date };
export type IRPFUpdate = Partial<Omit<IRPF, 'id' | 'created_at'>> & { updated_at?: Date };
export type ExpenseUpdate = Partial<Omit<Expense, 'id' | 'created_at'>> & { updated_at?: Date };

// Interface para resposta de autenticação
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nome: string;
    role?: string;
    permissions?: string[];
  };
  token: string;
  expires_in: number;
}

// Interface para dados de login
export interface LoginData {
  email: string;
  password: string;
}

// Interface para dados de registro
export interface RegisterData {
  email: string;
  password: string;
  nome: string;
  cpf: string;
  telefone?: string;
}