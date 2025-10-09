import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAuditSchema() {
  try {
    console.log('🚀 Iniciando configuração do schema de auditoria...');

    // Ler o arquivo SQL do schema de auditoria
    const schemaPath = join(__dirname, '../database/audit_schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    console.log('📄 Arquivo SQL carregado:', schemaPath);

    // Dividir o SQL em comandos individuais (separados por ';')
    const commands = schemaSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...`);

    // Executar cada comando individualmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim().length === 0) continue;

      console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });

        if (error) {
          // Alguns erros podem ser esperados (como tabela já existe)
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Comando ${i + 1}: ${error.message} (ignorado)`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            console.log('Comando que falhou:', command.substring(0, 100) + '...');
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.error(`❌ Erro ao executar comando ${i + 1}:`, cmdError.message);
        console.log('Comando que falhou:', command.substring(0, 100) + '...');
      }

      // Pequena pausa entre comandos
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎉 Configuração do schema de auditoria concluída!');
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['audit_logs', 'user_sessions', 'audit_settings']);

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('📋 Tabelas de auditoria encontradas:', tables?.map(t => t.table_name) || []);
    }

    // Verificar se as funções foram criadas
    console.log('🔍 Verificando funções criadas...');
    
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['log_audit_action', 'get_audit_stats', 'cleanup_old_audit_logs']);

    if (functionsError) {
      console.error('❌ Erro ao verificar funções:', functionsError.message);
    } else {
      console.log('⚙️  Funções de auditoria encontradas:', functions?.map(f => f.routine_name) || []);
    }

    console.log('✨ Schema de auditoria configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral na configuração:', error.message);
    process.exit(1);
  }
}

// Executar o script
setupAuditSchema();