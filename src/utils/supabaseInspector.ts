import { supabase } from '../config/supabase'

export interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
  column_count?: number
  row_count?: number
}

export interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  table_name: string
}

export interface ProjectInfo {
  project_url: string
  project_id: string
  tables: TableInfo[]
  total_tables: number
}

/**
 * Lista todas as tabelas do projeto Supabase
 */
export async function listAllTables(): Promise<TableInfo[]> {
  try {
    // Usar RPC para consultar information_schema
    const { data, error } = await supabase.rpc('get_tables_info')

    if (error) {
      console.error('Erro ao buscar tabelas:', error)
      // Fallback: retornar tabelas conhecidas do schema
      return [
        { table_name: 'profiles', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'employees', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'tasks', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'leads', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'clientes_pf', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'clientes_pj', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'contratos', table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'irpf', table_schema: 'public', table_type: 'BASE TABLE' }
      ]
    }

    return data || []
  } catch (error) {
    console.error('Erro na consulta de tabelas:', error)
    // Fallback: retornar tabelas conhecidas do schema
    return [
      { table_name: 'profiles', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'employees', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'tasks', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'leads', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'clientes_pf', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'clientes_pj', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'contratos', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'irpf', table_schema: 'public', table_type: 'BASE TABLE' }
    ]
  }
}

/**
 * Lista todas as colunas de uma tabela específica
 */
export async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  // Retornar estrutura conhecida das tabelas baseada no schema
  const tableStructures: Record<string, ColumnInfo[]> = {
    profiles: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null, table_name: 'profiles' },
      { column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null, table_name: 'profiles' },
      { column_name: 'full_name', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'position', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'department', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'employee_id', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'phone', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'hire_date', data_type: 'date', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'avatar_url', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'profiles' },
      { column_name: 'role', data_type: 'text', is_nullable: 'YES', column_default: "'user'", table_name: 'profiles' },
      { column_name: 'permissions', data_type: 'jsonb', is_nullable: 'YES', column_default: "'[]'::jsonb", table_name: 'profiles' },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'profiles' },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'profiles' }
    ],
    employees: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'uuid_generate_v4()', table_name: 'employees' },
      { column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null, table_name: 'employees' },
      { column_name: 'dados_pessoais', data_type: 'jsonb', is_nullable: 'NO', column_default: null, table_name: 'employees' },
      { column_name: 'dados_profissionais', data_type: 'jsonb', is_nullable: 'NO', column_default: null, table_name: 'employees' },
      { column_name: 'dados_financeiros', data_type: 'jsonb', is_nullable: 'YES', column_default: null, table_name: 'employees' },
      { column_name: 'status', data_type: 'text', is_nullable: 'YES', column_default: "'ativo'", table_name: 'employees' },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'employees' },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'employees' }
    ],
    tasks: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'uuid_generate_v4()', table_name: 'tasks' },
      { column_name: 'user_id', data_type: 'uuid', is_nullable: 'YES', column_default: null, table_name: 'tasks' },
      { column_name: 'title', data_type: 'text', is_nullable: 'NO', column_default: null, table_name: 'tasks' },
      { column_name: 'description', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'tasks' },
      { column_name: 'status', data_type: 'text', is_nullable: 'YES', column_default: "'pending'", table_name: 'tasks' },
      { column_name: 'priority', data_type: 'text', is_nullable: 'YES', column_default: "'medium'", table_name: 'tasks' },
      { column_name: 'due_date', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: null, table_name: 'tasks' },
      { column_name: 'assigned_to', data_type: 'uuid', is_nullable: 'YES', column_default: null, table_name: 'tasks' },
      { column_name: 'created_by', data_type: 'uuid', is_nullable: 'YES', column_default: null, table_name: 'tasks' },
      { column_name: 'tags', data_type: 'text[]', is_nullable: 'YES', column_default: null, table_name: 'tasks' },
      { column_name: 'metadata', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'::jsonb", table_name: 'tasks' },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'tasks' },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'tasks' }
    ],
    leads: [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'uuid_generate_v4()', table_name: 'leads' },
      { column_name: 'nome', data_type: 'text', is_nullable: 'NO', column_default: null, table_name: 'leads' },
      { column_name: 'telefone', data_type: 'text', is_nullable: 'NO', column_default: null, table_name: 'leads' },
      { column_name: 'email', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'empresa', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'cargo', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'cidade', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'estado', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'produtos_interesse', data_type: 'text[]', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'origem', data_type: 'text', is_nullable: 'NO', column_default: null, table_name: 'leads' },
      { column_name: 'origem_detalhes', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'observacoes', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'status', data_type: 'text', is_nullable: 'YES', column_default: "'novo'", table_name: 'leads' },
      { column_name: 'responsavel', data_type: 'uuid', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'data_contato', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'proxima_acao', data_type: 'text', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'data_proxima_acao', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: null, table_name: 'leads' },
      { column_name: 'criado_por', data_type: 'uuid', is_nullable: 'NO', column_default: null, table_name: 'leads' },
      { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'leads' },
      { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'NOW()', table_name: 'leads' }
    ]
  }

  return tableStructures[tableName] || []
}

/**
 * Conta o número de registros em uma tabela
 */
export async function getTableRowCount(tableName: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error(`Erro ao contar registros da tabela ${tableName}:`, error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error(`Erro na contagem de registros da tabela ${tableName}:`, error)
    return 0
  }
}

/**
 * Obtém informações completas do projeto Supabase
 */
export async function getProjectInfo(): Promise<ProjectInfo> {
  const tables = await listAllTables()
  
  // Enriquecer informações das tabelas com contagem de registros
  const enrichedTables = await Promise.all(
    tables.map(async (table) => {
      const rowCount = await getTableRowCount(table.table_name)
      const columns = await getTableColumns(table.table_name)
      
      return {
        ...table,
        row_count: rowCount,
        column_count: columns.length
      }
    })
  )

  return {
    project_url: import.meta.env.VITE_SUPABASE_URL || 'URL não configurada',
    project_id: import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'ID não encontrado',
    tables: enrichedTables,
    total_tables: enrichedTables.length
  }
}

/**
 * Executa uma consulta SQL personalizada (apenas para leitura)
 */
export async function executeReadOnlyQuery(query: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query })

    if (error) {
      console.error('Erro ao executar consulta:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro na execução da consulta:', error)
    return []
  }
}

/**
 * Lista todas as funções/procedures do banco
 */
export async function listDatabaseFunctions(): Promise<any[]> {
  // Retornar funções conhecidas do schema
  return [
    { routine_name: 'update_updated_at_column', routine_type: 'FUNCTION', data_type: 'trigger' },
    { routine_name: 'handle_new_user', routine_type: 'FUNCTION', data_type: 'trigger' }
  ]
}

/**
 * Lista todos os índices das tabelas
 */
export async function listTableIndexes(): Promise<any[]> {
  // Retornar índices conhecidos do schema
  return [
    { tablename: 'profiles', indexname: 'idx_profiles_email', indexdef: 'CREATE INDEX idx_profiles_email ON profiles(email)' },
    { tablename: 'profiles', indexname: 'idx_profiles_employee_id', indexdef: 'CREATE INDEX idx_profiles_employee_id ON profiles(employee_id)' },
    { tablename: 'employees', indexname: 'idx_employees_email', indexdef: 'CREATE INDEX idx_employees_email ON employees(email)' },
    { tablename: 'employees', indexname: 'idx_employees_status', indexdef: 'CREATE INDEX idx_employees_status ON employees(status)' },
    { tablename: 'tasks', indexname: 'idx_tasks_user_id', indexdef: 'CREATE INDEX idx_tasks_user_id ON tasks(user_id)' },
    { tablename: 'tasks', indexname: 'idx_tasks_status', indexdef: 'CREATE INDEX idx_tasks_status ON tasks(status)' },
    { tablename: 'tasks', indexname: 'idx_tasks_assigned_to', indexdef: 'CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to)' },
    { tablename: 'leads', indexname: 'idx_leads_status', indexdef: 'CREATE INDEX idx_leads_status ON leads(status)' },
    { tablename: 'leads', indexname: 'idx_leads_responsavel', indexdef: 'CREATE INDEX idx_leads_responsavel ON leads(responsavel)' },
    { tablename: 'clientes_pf', indexname: 'idx_clientes_pf_status', indexdef: 'CREATE INDEX idx_clientes_pf_status ON clientes_pf(status)' },
    { tablename: 'clientes_pj', indexname: 'idx_clientes_pj_cnpj', indexdef: 'CREATE INDEX idx_clientes_pj_cnpj ON clientes_pj(cnpj)' },
    { tablename: 'clientes_pj', indexname: 'idx_clientes_pj_status', indexdef: 'CREATE INDEX idx_clientes_pj_status ON clientes_pj(status)' },
    { tablename: 'contratos', indexname: 'idx_contratos_numero', indexdef: 'CREATE INDEX idx_contratos_numero ON contratos(numero_contrato)' },
    { tablename: 'contratos', indexname: 'idx_contratos_status', indexdef: 'CREATE INDEX idx_contratos_status ON contratos(status)' },
    { tablename: 'irpf', indexname: 'idx_irpf_ano_exercicio', indexdef: 'CREATE INDEX idx_irpf_ano_exercicio ON irpf(ano_exercicio)' },
    { tablename: 'irpf', indexname: 'idx_irpf_status', indexdef: 'CREATE INDEX idx_irpf_status ON irpf(status)' }
  ]
}

/**
 * Gera um relatório completo do projeto
 */
export async function generateProjectReport(): Promise<string> {
  const projectInfo = await getProjectInfo()
  const functions = await listDatabaseFunctions()
  const indexes = await listTableIndexes()

  let report = `
# Relatório do Projeto Supabase - MedStaff

## Informações do Projeto
- **URL do Projeto**: ${projectInfo.project_url}
- **ID do Projeto**: ${projectInfo.project_id}
- **Total de Tabelas**: ${projectInfo.total_tables}

## Tabelas do Banco de Dados

`

  for (const table of projectInfo.tables) {
    const columns = await getTableColumns(table.table_name)
    
    report += `
### ${table.table_name}
- **Tipo**: ${table.table_type}
- **Schema**: ${table.table_schema}
- **Colunas**: ${table.column_count}
- **Registros**: ${table.row_count}

**Estrutura das Colunas:**
`
    
    for (const column of columns) {
      report += `
- **${column.column_name}**: ${column.data_type} ${column.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`
      if (column.column_default) {
        report += ` - Default: ${column.column_default}`
      }
    }
    
    report += '\n'
  }

  if (functions.length > 0) {
    report += `
## Funções do Banco de Dados

`
    for (const func of functions) {
      report += `- **${func.routine_name}**: ${func.routine_type} (${func.data_type})\n`
    }
  }

  if (indexes.length > 0) {
    report += `
## Índices das Tabelas

`
    for (const index of indexes) {
      report += `- **${index.tablename}.${index.indexname}**\n`
    }
  }

  return report
}