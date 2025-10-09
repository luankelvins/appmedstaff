#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createIndexes() {
  console.log('🔧 Criando índices para otimização de performance...')
  
  const indexes = [
    // Índices para admin_documents
    { name: 'idx_admin_documents_categoria', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_documents_categoria ON admin_documents(categoria);' },
    { name: 'idx_admin_documents_status', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);' },
    { name: 'idx_admin_documents_criado_por', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_documents_criado_por ON admin_documents(criado_por);' },
    { name: 'idx_admin_documents_data_validade', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_documents_data_validade ON admin_documents(data_validade);' },
    
    // Índices para time_entries
    { name: 'idx_time_entries_employee_data', sql: 'CREATE INDEX IF NOT EXISTS idx_time_entries_employee_data ON time_entries(employee_id, data_ponto);' },
    { name: 'idx_time_entries_status', sql: 'CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);' },
    { name: 'idx_time_entries_data_ponto', sql: 'CREATE INDEX IF NOT EXISTS idx_time_entries_data_ponto ON time_entries(data_ponto);' },
    { name: 'idx_time_entries_tipo_registro', sql: 'CREATE INDEX IF NOT EXISTS idx_time_entries_tipo_registro ON time_entries(tipo_registro);' },
    
    // Índices para time_validations
    { name: 'idx_time_validations_time_entry', sql: 'CREATE INDEX IF NOT EXISTS idx_time_validations_time_entry ON time_validations(time_entry_id);' },
    { name: 'idx_time_validations_employee', sql: 'CREATE INDEX IF NOT EXISTS idx_time_validations_employee ON time_validations(employee_id);' },
    { name: 'idx_time_validations_validador', sql: 'CREATE INDEX IF NOT EXISTS idx_time_validations_validador ON time_validations(validador_id);' },
    { name: 'idx_time_validations_status', sql: 'CREATE INDEX IF NOT EXISTS idx_time_validations_status ON time_validations(status_novo);' },
    
    // Índices para system_settings
    { name: 'idx_system_settings_categoria_chave', sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_categoria_chave ON system_settings(categoria, chave);' },
    { name: 'idx_system_settings_categoria', sql: 'CREATE INDEX IF NOT EXISTS idx_system_settings_categoria ON system_settings(categoria);' },
    { name: 'idx_system_settings_grupo', sql: 'CREATE INDEX IF NOT EXISTS idx_system_settings_grupo ON system_settings(grupo_configuracao);' },
    
    // Índices para admin_reports
    { name: 'idx_admin_reports_tipo', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_reports_tipo ON admin_reports(tipo_relatorio);' },
    { name: 'idx_admin_reports_criado_por', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_reports_criado_por ON admin_reports(criado_por);' },
    { name: 'idx_admin_reports_status', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_reports_status ON admin_reports(status);' },
    { name: 'idx_admin_reports_proxima_execucao', sql: 'CREATE INDEX IF NOT EXISTS idx_admin_reports_proxima_execucao ON admin_reports(proxima_execucao);' },
    
    // Índices para audit_logs
    { name: 'idx_audit_logs_usuario', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario_id);' },
    { name: 'idx_audit_logs_tabela_registro', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela_registro ON audit_logs(tabela_afetada, registro_id);' },
    { name: 'idx_audit_logs_categoria', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_categoria ON audit_logs(categoria);' },
    { name: 'idx_audit_logs_modulo', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON audit_logs(modulo);' },
    { name: 'idx_audit_logs_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);' },
    { name: 'idx_audit_logs_severidade', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_severidade ON audit_logs(nivel_severidade);' }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const index of indexes) {
    try {
      console.log(`⏳ Criando índice ${index.name}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: index.sql })
      
      if (error) {
        console.error(`❌ Erro ao criar índice ${index.name}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Índice ${index.name} criado`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao criar índice ${index.name}:`, err.message)
      errorCount++
    }
  }
  
  console.log(`\n📊 Resumo dos índices: ${successCount} criados, ${errorCount} erros`)
}

async function createRLSPolicies() {
  console.log('\n🔒 Criando políticas RLS (Row Level Security)...')
  
  const policies = [
    // Habilitar RLS nas tabelas
    { name: 'enable_rls_admin_documents', sql: 'ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;' },
    { name: 'enable_rls_time_entries', sql: 'ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;' },
    { name: 'enable_rls_time_validations', sql: 'ALTER TABLE time_validations ENABLE ROW LEVEL SECURITY;' },
    { name: 'enable_rls_system_settings', sql: 'ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;' },
    { name: 'enable_rls_admin_reports', sql: 'ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;' },
    { name: 'enable_rls_audit_logs', sql: 'ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;' },
    
    // Políticas para admin_documents
    { 
      name: 'admin_documents_select_policy', 
      sql: `CREATE POLICY "Usuários podem visualizar documentos" ON admin_documents FOR SELECT USING (auth.uid() IS NOT NULL);` 
    },
    { 
      name: 'admin_documents_insert_policy', 
      sql: `CREATE POLICY "Usuários podem criar documentos" ON admin_documents FOR INSERT WITH CHECK (auth.uid() = criado_por);` 
    },
    { 
      name: 'admin_documents_update_policy', 
      sql: `CREATE POLICY "Usuários podem atualizar seus documentos" ON admin_documents FOR UPDATE USING (auth.uid() = criado_por OR auth.uid() = aprovado_por);` 
    },
    
    // Políticas para time_entries
    { 
      name: 'time_entries_select_policy', 
      sql: `CREATE POLICY "Funcionários podem ver seus pontos" ON time_entries FOR SELECT USING (
        EXISTS (SELECT 1 FROM employees WHERE employees.id = time_entries.employee_id AND employees.email = auth.jwt() ->> 'email')
        OR EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
      );` 
    },
    { 
      name: 'time_entries_insert_policy', 
      sql: `CREATE POLICY "Funcionários podem registrar ponto" ON time_entries FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM employees WHERE employees.id = time_entries.employee_id AND employees.email = auth.jwt() ->> 'email')
      );` 
    },
    { 
      name: 'time_entries_update_policy', 
      sql: `CREATE POLICY "Funcionários podem atualizar seus pontos pendentes" ON time_entries FOR UPDATE USING (
        EXISTS (SELECT 1 FROM employees WHERE employees.id = time_entries.employee_id AND employees.email = auth.jwt() ->> 'email')
        AND status = 'pendente'
      );` 
    },
    
    // Políticas para time_validations
    { 
      name: 'time_validations_select_policy', 
      sql: `CREATE POLICY "Usuários podem ver validações relacionadas" ON time_validations FOR SELECT USING (
        auth.uid() = validador_id 
        OR EXISTS (SELECT 1 FROM employees WHERE employees.id = time_validations.employee_id AND employees.email = auth.jwt() ->> 'email')
      );` 
    },
    { 
      name: 'time_validations_insert_policy', 
      sql: `CREATE POLICY "Gestores podem criar validações" ON time_validations FOR INSERT WITH CHECK (
        auth.uid() = validador_id 
        AND EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
      );` 
    },
    
    // Políticas para system_settings
    { 
      name: 'system_settings_select_policy', 
      sql: `CREATE POLICY "Usuários podem ver configurações visíveis" ON system_settings FOR SELECT USING (
        visivel_usuario = true 
        OR EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
      );` 
    },
    { 
      name: 'system_settings_update_policy', 
      sql: `CREATE POLICY "Apenas admins podem alterar configurações" ON system_settings FOR UPDATE USING (
        EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
      );` 
    },
    
    // Políticas para admin_reports
    { 
      name: 'admin_reports_select_policy', 
      sql: `CREATE POLICY "Usuários podem ver relatórios públicos ou próprios" ON admin_reports FOR SELECT USING (
        publico = true 
        OR auth.uid() = criado_por 
        OR auth.uid() = ANY(compartilhado_com)
        OR EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
      );` 
    },
    { 
      name: 'admin_reports_insert_policy', 
      sql: `CREATE POLICY "Usuários podem criar relatórios" ON admin_reports FOR INSERT WITH CHECK (auth.uid() = criado_por);` 
    },
    { 
      name: 'admin_reports_update_policy', 
      sql: `CREATE POLICY "Usuários podem atualizar seus relatórios" ON admin_reports FOR UPDATE USING (auth.uid() = criado_por);` 
    },
    
    // Políticas para audit_logs
    { 
      name: 'audit_logs_select_policy', 
      sql: `CREATE POLICY "Apenas admins podem ver logs de auditoria" ON audit_logs FOR SELECT USING (
        EXISTS (SELECT 1 FROM employees WHERE employees.email = auth.jwt() ->> 'email' AND role IN ('admin', 'superadmin'))
      );` 
    },
    { 
      name: 'audit_logs_insert_policy', 
      sql: `CREATE POLICY "Sistema pode inserir logs" ON audit_logs FOR INSERT WITH CHECK (true);` 
    }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const policy of policies) {
    try {
      console.log(`⏳ Criando política ${policy.name}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: policy.sql })
      
      if (error) {
        // Ignorar erros de política já existente
        if (error.message.includes('already exists')) {
          console.log(`✅ Política ${policy.name} já existe`)
          successCount++
        } else {
          console.error(`❌ Erro ao criar política ${policy.name}:`, error.message)
          errorCount++
        }
      } else {
        console.log(`✅ Política ${policy.name} criada`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao criar política ${policy.name}:`, err.message)
      errorCount++
    }
  }
  
  console.log(`\n📊 Resumo das políticas: ${successCount} criadas, ${errorCount} erros`)
}

async function createTriggers() {
  console.log('\n⚡ Criando triggers para updated_at...')
  
  const triggers = [
    { 
      table: 'admin_documents',
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        CREATE TRIGGER update_admin_documents_updated_at 
          BEFORE UPDATE ON admin_documents 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    },
    { 
      table: 'time_entries',
      sql: `
        CREATE TRIGGER update_time_entries_updated_at 
          BEFORE UPDATE ON time_entries 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    },
    { 
      table: 'system_settings',
      sql: `
        CREATE TRIGGER update_system_settings_updated_at 
          BEFORE UPDATE ON system_settings 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    },
    { 
      table: 'admin_reports',
      sql: `
        CREATE TRIGGER update_admin_reports_updated_at 
          BEFORE UPDATE ON admin_reports 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    }
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const trigger of triggers) {
    try {
      console.log(`⏳ Criando trigger para ${trigger.table}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: trigger.sql })
      
      if (error) {
        console.error(`❌ Erro ao criar trigger para ${trigger.table}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Trigger para ${trigger.table} criado`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao criar trigger para ${trigger.table}:`, err.message)
      errorCount++
    }
  }
  
  console.log(`\n📊 Resumo dos triggers: ${successCount} criados, ${errorCount} erros`)
}

async function insertInitialSettings() {
  console.log('\n📝 Inserindo configurações iniciais do sistema...')
  
  const initialSettings = [
    // Configurações de Ponto
    { categoria: 'ponto', chave: 'horario_entrada_padrao', valor: '"08:00"', tipo_valor: 'string', descricao: 'Horário padrão de entrada dos funcionários', grupo_configuracao: 'Controle de Ponto', ordem_exibicao: 1 },
    { categoria: 'ponto', chave: 'horario_saida_padrao', valor: '"18:00"', tipo_valor: 'string', descricao: 'Horário padrão de saída dos funcionários', grupo_configuracao: 'Controle de Ponto', ordem_exibicao: 2 },
    { categoria: 'ponto', chave: 'tolerancia_atraso_minutos', valor: '15', tipo_valor: 'number', descricao: 'Tolerância em minutos para atrasos', grupo_configuracao: 'Controle de Ponto', ordem_exibicao: 3 },
    { categoria: 'ponto', chave: 'horario_almoco_inicio', valor: '"12:00"', tipo_valor: 'string', descricao: 'Horário padrão de início do almoço', grupo_configuracao: 'Controle de Ponto', ordem_exibicao: 4 },
    { categoria: 'ponto', chave: 'horario_almoco_fim', valor: '"13:00"', tipo_valor: 'string', descricao: 'Horário padrão de fim do almoço', grupo_configuracao: 'Controle de Ponto', ordem_exibicao: 5 },
    { categoria: 'ponto', chave: 'validacao_automatica', valor: 'false', tipo_valor: 'boolean', descricao: 'Validação automática de pontos dentro do horário', grupo_configuracao: 'Controle de Ponto', ordem_exibicao: 6 },
    
    // Configurações do Sistema
    { categoria: 'sistema', chave: 'nome_empresa', valor: '"MedStaff"', tipo_valor: 'string', descricao: 'Nome da empresa', grupo_configuracao: 'Geral', ordem_exibicao: 1 },
    { categoria: 'sistema', chave: 'timezone', valor: '"America/Sao_Paulo"', tipo_valor: 'string', descricao: 'Fuso horário do sistema', grupo_configuracao: 'Geral', ordem_exibicao: 2 },
    { categoria: 'sistema', chave: 'idioma_padrao', valor: '"pt-BR"', tipo_valor: 'string', descricao: 'Idioma padrão do sistema', grupo_configuracao: 'Geral', ordem_exibicao: 3 },
    { categoria: 'sistema', chave: 'backup_automatico', valor: 'true', tipo_valor: 'boolean', descricao: 'Backup automático dos dados', grupo_configuracao: 'Segurança', ordem_exibicao: 1 },
    
    // Configurações de Documentos
    { categoria: 'documentos', chave: 'tamanho_maximo_mb', valor: '50', tipo_valor: 'number', descricao: 'Tamanho máximo de arquivo em MB', grupo_configuracao: 'Documentos', ordem_exibicao: 1 },
    { categoria: 'documentos', chave: 'tipos_permitidos', valor: '["pdf", "doc", "docx", "jpg", "png"]', tipo_valor: 'array', descricao: 'Tipos de arquivo permitidos', grupo_configuracao: 'Documentos', ordem_exibicao: 2 },
    { categoria: 'documentos', chave: 'aprovacao_obrigatoria', valor: 'true', tipo_valor: 'boolean', descricao: 'Aprovação obrigatória para documentos', grupo_configuracao: 'Documentos', ordem_exibicao: 3 },
    
    // Configurações de Relatórios
    { categoria: 'relatorios', chave: 'formato_padrao', valor: '"pdf"', tipo_valor: 'string', descricao: 'Formato padrão dos relatórios', grupo_configuracao: 'Relatórios', ordem_exibicao: 1 },
    { categoria: 'relatorios', chave: 'retencao_dias', valor: '90', tipo_valor: 'number', descricao: 'Dias de retenção dos relatórios gerados', grupo_configuracao: 'Relatórios', ordem_exibicao: 2 },
    
    // Configurações de Auditoria
    { categoria: 'auditoria', chave: 'log_todas_acoes', valor: 'true', tipo_valor: 'boolean', descricao: 'Registrar todas as ações dos usuários', grupo_configuracao: 'Auditoria', ordem_exibicao: 1 },
    { categoria: 'auditoria', chave: 'retencao_logs_dias', valor: '365', tipo_valor: 'number', descricao: 'Dias de retenção dos logs de auditoria', grupo_configuracao: 'Auditoria', ordem_exibicao: 2 }
  ]
  
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(initialSettings, { onConflict: 'categoria,chave' })
    
    if (error) {
      console.error('❌ Erro ao inserir configurações:', error.message)
    } else {
      console.log(`✅ ${initialSettings.length} configurações iniciais inseridas/atualizadas`)
    }
  } catch (err) {
    console.error('❌ Erro inesperado ao inserir configurações:', err.message)
  }
}

// Executar todas as configurações
async function setupAdministrativeFeatures() {
  console.log('🚀 Configurando recursos administrativos...')
  console.log(`📍 URL: ${supabaseUrl}`)
  console.log(`🔑 Projeto ID: ${supabaseUrl.split('//')[1]?.split('.')[0]}`)
  
  await createIndexes()
  await createRLSPolicies()
  await createTriggers()
  await insertInitialSettings()
  
  console.log('\n🎉 Configuração dos recursos administrativos concluída!')
}

setupAdministrativeFeatures().catch(console.error)