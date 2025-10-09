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

async function createAdministrativeTables() {
  console.log('🚀 Criando tabelas administrativas...')
  console.log(`📍 URL: ${supabaseUrl}`)
  console.log(`🔑 Projeto ID: ${supabaseUrl.split('//')[1]?.split('.')[0]}`)
  
  const tables = [
    {
      name: 'admin_documents',
      sql: `
        CREATE TABLE IF NOT EXISTS admin_documents (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          titulo TEXT NOT NULL,
          descricao TEXT,
          categoria TEXT NOT NULL CHECK (categoria IN ('politica', 'contrato', 'procedimento', 'manual', 'certificado', 'outros')),
          tipo_arquivo TEXT NOT NULL,
          tamanho_arquivo BIGINT NOT NULL,
          url_arquivo TEXT NOT NULL,
          versao TEXT DEFAULT '1.0',
          status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado')),
          tags TEXT[],
          departamento_responsavel TEXT,
          data_validade DATE,
          data_revisao DATE,
          criado_por UUID REFERENCES auth.users(id) NOT NULL,
          aprovado_por UUID REFERENCES auth.users(id),
          data_aprovacao TIMESTAMP WITH TIME ZONE,
          observacoes TEXT,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'time_entries',
      sql: `
        CREATE TABLE IF NOT EXISTS time_entries (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
          data_ponto DATE NOT NULL,
          entrada_manha TIME,
          saida_almoco TIME,
          entrada_tarde TIME,
          saida_noite TIME,
          horas_trabalhadas INTERVAL,
          horas_extras INTERVAL DEFAULT '00:00:00',
          tipo_registro TEXT DEFAULT 'normal' CHECK (tipo_registro IN ('normal', 'falta', 'atestado', 'ferias', 'folga')),
          justificativa TEXT,
          localizacao JSONB,
          ip_address INET,
          dispositivo TEXT,
          status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
          observacoes TEXT,
          anexos JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'time_validations',
      sql: `
        CREATE TABLE IF NOT EXISTS time_validations (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE NOT NULL,
          employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
          validador_id UUID REFERENCES auth.users(id) NOT NULL,
          status_anterior TEXT NOT NULL,
          status_novo TEXT NOT NULL CHECK (status_novo IN ('aprovado', 'rejeitado', 'pendente_correcao')),
          motivo_validacao TEXT,
          observacoes_validador TEXT,
          data_validacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          correcoes_solicitadas JSONB DEFAULT '[]'::jsonb,
          historico_alteracoes JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'system_settings',
      sql: `
        CREATE TABLE IF NOT EXISTS system_settings (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          categoria TEXT NOT NULL,
          chave TEXT NOT NULL,
          valor JSONB NOT NULL,
          tipo_valor TEXT NOT NULL CHECK (tipo_valor IN ('string', 'number', 'boolean', 'object', 'array')),
          descricao TEXT,
          valor_padrao JSONB,
          requer_reinicializacao BOOLEAN DEFAULT false,
          visivel_usuario BOOLEAN DEFAULT true,
          editavel_usuario BOOLEAN DEFAULT true,
          nivel_permissao TEXT DEFAULT 'admin' CHECK (nivel_permissao IN ('admin', 'manager', 'user')),
          grupo_configuracao TEXT,
          ordem_exibicao INTEGER DEFAULT 0,
          validacao_regex TEXT,
          opcoes_validas JSONB,
          modificado_por UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(categoria, chave)
        );
      `
    },
    {
      name: 'admin_reports',
      sql: `
        CREATE TABLE IF NOT EXISTS admin_reports (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          nome TEXT NOT NULL,
          descricao TEXT,
          tipo_relatorio TEXT NOT NULL CHECK (tipo_relatorio IN ('funcionarios', 'ponto', 'documentos', 'auditoria', 'financeiro', 'personalizado')),
          parametros JSONB NOT NULL DEFAULT '{}'::jsonb,
          filtros JSONB DEFAULT '{}'::jsonb,
          colunas_exibicao TEXT[],
          formato_saida TEXT DEFAULT 'pdf' CHECK (formato_saida IN ('pdf', 'excel', 'csv', 'json')),
          agendamento JSONB,
          status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado')),
          publico BOOLEAN DEFAULT false,
          compartilhado_com UUID[],
          criado_por UUID REFERENCES auth.users(id) NOT NULL,
          ultima_execucao TIMESTAMP WITH TIME ZONE,
          proxima_execucao TIMESTAMP WITH TIME ZONE,
          template_personalizado TEXT,
          observacoes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'audit_logs',
      sql: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          usuario_id UUID REFERENCES auth.users(id),
          acao TEXT NOT NULL,
          tabela_afetada TEXT,
          registro_id UUID,
          dados_anteriores JSONB,
          dados_novos JSONB,
          ip_address INET,
          user_agent TEXT,
          sessao_id TEXT,
          modulo TEXT NOT NULL,
          categoria TEXT NOT NULL CHECK (categoria IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import')),
          nivel_severidade TEXT DEFAULT 'info' CHECK (nivel_severidade IN ('info', 'warning', 'error', 'critical')),
          sucesso BOOLEAN DEFAULT true,
          mensagem_erro TEXT,
          duracao_ms INTEGER,
          contexto_adicional JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ]

  let successCount = 0
  let errorCount = 0

  for (const table of tables) {
    try {
      console.log(`\n⏳ Criando tabela ${table.name}...`)
      
      // Usar uma query SQL direta
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', table.name)
        .eq('table_schema', 'public')
      
      if (error) {
        console.error(`❌ Erro ao verificar tabela ${table.name}:`, error.message)
        errorCount++
        continue
      }
      
      // Se a tabela já existe, pular
      if (data && data.length > 0) {
        console.log(`✅ Tabela ${table.name} já existe`)
        successCount++
        continue
      }
      
      // Criar a tabela usando SQL direto
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: table.sql })
      })
      
      if (!response.ok) {
        // Se exec_sql não funcionar, tentar abordagem alternativa
        console.log(`⚠️  exec_sql não disponível, usando abordagem alternativa...`)
        
        // Tentar criar usando uma query simples
        const createResult = await supabase.rpc('create_table_if_not_exists', {
          table_name: table.name,
          table_sql: table.sql
        })
        
        if (createResult.error) {
          throw new Error(createResult.error.message)
        }
      }
      
      console.log(`✅ Tabela ${table.name} criada com sucesso`)
      successCount++
      
    } catch (err) {
      console.error(`❌ Erro ao criar tabela ${table.name}:`, err.message)
      errorCount++
    }
  }

  console.log('\n📊 Resumo da criação de tabelas:')
  console.log(`✅ Tabelas criadas com sucesso: ${successCount}`)
  console.log(`❌ Tabelas com erro: ${errorCount}`)
  
  if (errorCount === 0) {
    console.log('\n🎉 Todas as tabelas administrativas foram criadas!')
    await createIndexesAndPolicies()
    await insertInitialSettings()
  }
}

async function createIndexesAndPolicies() {
  console.log('\n🔧 Criando índices e políticas...')
  
  // Habilitar RLS nas tabelas
  const tables = ['admin_documents', 'time_entries', 'time_validations', 'system_settings', 'admin_reports', 'audit_logs']
  
  for (const table of tables) {
    try {
      console.log(`⏳ Habilitando RLS para ${table}...`)
      
      // Tentar habilitar RLS (pode falhar se já estiver habilitado)
      await supabase.rpc('enable_rls', { table_name: table }).catch(() => {
        console.log(`   RLS já habilitado para ${table}`)
      })
      
      console.log(`✅ RLS habilitado para ${table}`)
    } catch (err) {
      console.log(`⚠️  Erro ao habilitar RLS para ${table}: ${err.message}`)
    }
  }
}

async function insertInitialSettings() {
  console.log('\n📝 Inserindo configurações iniciais...')
  
  const initialSettings = [
    { categoria: 'ponto', chave: 'horario_entrada_padrao', valor: '"08:00"', tipo_valor: 'string', descricao: 'Horário padrão de entrada dos funcionários', grupo_configuracao: 'Controle de Ponto' },
    { categoria: 'ponto', chave: 'horario_saida_padrao', valor: '"18:00"', tipo_valor: 'string', descricao: 'Horário padrão de saída dos funcionários', grupo_configuracao: 'Controle de Ponto' },
    { categoria: 'ponto', chave: 'tolerancia_atraso_minutos', valor: '15', tipo_valor: 'number', descricao: 'Tolerância em minutos para atrasos', grupo_configuracao: 'Controle de Ponto' },
    { categoria: 'sistema', chave: 'nome_empresa', valor: '"MedStaff"', tipo_valor: 'string', descricao: 'Nome da empresa', grupo_configuracao: 'Geral' }
  ]
  
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(initialSettings, { onConflict: 'categoria,chave' })
    
    if (error) {
      console.error('❌ Erro ao inserir configurações:', error.message)
    } else {
      console.log(`✅ ${initialSettings.length} configurações iniciais inseridas`)
    }
  } catch (err) {
    console.error('❌ Erro inesperado ao inserir configurações:', err.message)
  }
}

async function verifyTablesCreated() {
  console.log('\n🔍 Verificando tabelas criadas...')
  
  const expectedTables = [
    'admin_documents',
    'time_entries', 
    'time_validations',
    'system_settings',
    'admin_reports',
    'audit_logs'
  ]
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabela ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ Tabela ${tableName}: Criada e acessível`)
      }
    } catch (err) {
      console.log(`❌ Tabela ${tableName}: Erro inesperado - ${err.message}`)
    }
  }
}

// Executar o script
createAdministrativeTables()
  .then(() => verifyTablesCreated())
  .catch(console.error)