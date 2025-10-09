import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixCreatedByColumns() {
  console.log('🔧 Corrigindo colunas created_by e updated_by...');
  
  const alterSQL = `
    -- Tornar colunas created_by e updated_by opcionais
    ALTER TABLE financial_categories ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE financial_categories ALTER COLUMN updated_by DROP NOT NULL;
    
    ALTER TABLE bank_accounts ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE bank_accounts ALTER COLUMN updated_by DROP NOT NULL;
    
    ALTER TABLE payment_methods ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE payment_methods ALTER COLUMN updated_by DROP NOT NULL;
    
    ALTER TABLE revenues ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE revenues ALTER COLUMN updated_by DROP NOT NULL;
    
    ALTER TABLE expenses ALTER COLUMN created_by DROP NOT NULL;
    ALTER TABLE expenses ALTER COLUMN updated_by DROP NOT NULL;
  `;
  
  try {
    // Tentar executar via RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: alterSQL });
    
    if (error) {
      console.log('⚠️  RPC exec_sql não disponível. Execute manualmente no Supabase Dashboard:');
      console.log('\n' + '='.repeat(80));
      console.log(alterSQL);
      console.log('='.repeat(80) + '\n');
    } else {
      console.log('✅ Colunas corrigidas com sucesso!');
    }
  } catch (err) {
    console.log('⚠️  Erro ao executar SQL. Execute manualmente no Supabase Dashboard:');
    console.log('\n' + '='.repeat(80));
    console.log(alterSQL);
    console.log('='.repeat(80) + '\n');
  }
}

fixCreatedByColumns();