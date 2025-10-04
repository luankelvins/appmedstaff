import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filePath, description) {
  try {
    console.log(`\n📄 Executando: ${description}`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Dividir o SQL em comandos individuais (separados por ';')
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.trim()) {
        console.log(`   Executando comando: ${command.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });
        
        if (error) {
          // Tentar executar diretamente se RPC falhar
          const { error: directError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(1);
            
          if (directError) {
            console.log(`   ⚠️  Tentando execução alternativa...`);
            // Usar uma abordagem diferente para comandos DDL
            const { error: altError } = await supabase.rpc('exec_ddl', {
              ddl_statement: command
            });
            
            if (altError) {
              console.error(`   ❌ Erro ao executar comando: ${altError.message}`);
              throw altError;
            }
          } else {
            console.error(`   ❌ Erro ao executar comando: ${error.message}`);
            throw error;
          }
        }
        
        console.log(`   ✅ Comando executado com sucesso`);
      }
    }
    
    console.log(`✅ ${description} - Concluído com sucesso!`);
    
  } catch (error) {
    console.error(`❌ Erro ao executar ${description}:`, error.message);
    throw error;
  }
}

async function createFinancialTables() {
  try {
    console.log('🚀 Iniciando migração das tabelas financeiras...\n');

    // Executar schema principal
    const schemaPath = path.join(__dirname, '../database/financial_schema.sql');
    await executeSQLFile(schemaPath, 'Schema das tabelas financeiras');

    // Executar dados de exemplo
    const sampleDataPath = path.join(__dirname, '../database/financial_sample_data.sql');
    await executeSQLFile(sampleDataPath, 'Dados de exemplo');

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('   • financial_categories');
    console.log('   • bank_accounts');
    console.log('   • payment_methods');
    console.log('   • revenues');
    console.log('   • expenses');
    console.log('   • financial_change_history');
    console.log('   • financial_notifications');
    console.log('   • financial_reports');
    console.log('   • financial_settings');

  } catch (error) {
    console.error('\n💥 Falha na migração:', error.message);
    process.exit(1);
  }
}

// Função alternativa usando SQL direto
async function createTablesDirectly() {
  console.log('🔄 Tentando abordagem alternativa com SQL direto...\n');
  
  const tables = [
    {
      name: 'financial_categories',
      sql: `
        CREATE TABLE IF NOT EXISTS financial_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
          color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
          icon VARCHAR(50),
          parent_category_id UUID REFERENCES financial_categories(id),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by VARCHAR(100) DEFAULT 'system',
          updated_by VARCHAR(100) DEFAULT 'system'
        );
      `
    },
    {
      name: 'bank_accounts',
      sql: `
        CREATE TABLE IF NOT EXISTS bank_accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          bank VARCHAR(100) NOT NULL,
          account_number VARCHAR(50) NOT NULL,
          agency VARCHAR(20) NOT NULL,
          account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment')),
          balance DECIMAL(15,2) DEFAULT 0.00,
          is_active BOOLEAN DEFAULT true,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by VARCHAR(100) DEFAULT 'system',
          updated_by VARCHAR(100) DEFAULT 'system'
        );
      `
    },
    {
      name: 'payment_methods',
      sql: `
        CREATE TABLE IF NOT EXISTS payment_methods (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check', 'other')),
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          bank_account_id UUID REFERENCES bank_accounts(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by VARCHAR(100) DEFAULT 'system',
          updated_by VARCHAR(100) DEFAULT 'system'
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Criando tabela: ${table.name}`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: table.sql 
      });
      
      if (error) {
        console.error(`❌ Erro ao criar ${table.name}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table.name} criada com sucesso`);
      }
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar ${table.name}:`, error.message);
    }
  }
}

// Executar migração
if (process.argv.includes('--direct')) {
  createTablesDirectly();
} else {
  createFinancialTables();
}