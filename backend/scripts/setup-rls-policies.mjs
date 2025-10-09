import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Políticas RLS para as tabelas financeiras
const rlsPolicies = [
  {
    table: 'financial_categories',
    policies: [
      {
        name: 'Enable read access for all users',
        operation: 'SELECT',
        policy: 'true'
      },
      {
        name: 'Enable insert for authenticated users only',
        operation: 'INSERT',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable update for authenticated users only',
        operation: 'UPDATE',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable delete for authenticated users only',
        operation: 'DELETE',
        policy: 'auth.role() = \'authenticated\''
      }
    ]
  },
  {
    table: 'bank_accounts',
    policies: [
      {
        name: 'Enable read access for all users',
        operation: 'SELECT',
        policy: 'true'
      },
      {
        name: 'Enable insert for authenticated users only',
        operation: 'INSERT',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable update for authenticated users only',
        operation: 'UPDATE',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable delete for authenticated users only',
        operation: 'DELETE',
        policy: 'auth.role() = \'authenticated\''
      }
    ]
  },
  {
    table: 'payment_methods',
    policies: [
      {
        name: 'Enable read access for all users',
        operation: 'SELECT',
        policy: 'true'
      },
      {
        name: 'Enable insert for authenticated users only',
        operation: 'INSERT',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable update for authenticated users only',
        operation: 'UPDATE',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable delete for authenticated users only',
        operation: 'DELETE',
        policy: 'auth.role() = \'authenticated\''
      }
    ]
  },
  {
    table: 'revenues',
    policies: [
      {
        name: 'Enable read access for all users',
        operation: 'SELECT',
        policy: 'true'
      },
      {
        name: 'Enable insert for authenticated users only',
        operation: 'INSERT',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable update for authenticated users only',
        operation: 'UPDATE',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable delete for authenticated users only',
        operation: 'DELETE',
        policy: 'auth.role() = \'authenticated\''
      }
    ]
  },
  {
    table: 'expenses',
    policies: [
      {
        name: 'Enable read access for all users',
        operation: 'SELECT',
        policy: 'true'
      },
      {
        name: 'Enable insert for authenticated users only',
        operation: 'INSERT',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable update for authenticated users only',
        operation: 'UPDATE',
        policy: 'auth.role() = \'authenticated\''
      },
      {
        name: 'Enable delete for authenticated users only',
        operation: 'DELETE',
        policy: 'auth.role() = \'authenticated\''
      }
    ]
  }
];

async function setupRLSPolicies() {
  console.log('🔒 Configurando políticas RLS para tabelas financeiras...\n');

  // Gerar SQL para habilitar RLS e criar políticas
  let sqlCommands = [];

  for (const tableConfig of rlsPolicies) {
    const { table, policies } = tableConfig;
    
    console.log(`📋 Configurando RLS para tabela: ${table}`);
    
    // Habilitar RLS na tabela
    sqlCommands.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    
    // Criar políticas
    for (const policy of policies) {
      const policyName = `${table}_${policy.operation.toLowerCase()}_policy`;
      
      // Remover política existente se houver
      sqlCommands.push(`DROP POLICY IF EXISTS "${policyName}" ON ${table};`);
      
      // Criar nova política
      sqlCommands.push(
        `CREATE POLICY "${policyName}" ON ${table} FOR ${policy.operation} USING (${policy.policy});`
      );
    }
    
    sqlCommands.push(''); // Linha em branco para separação
  }

  console.log('\n📝 SQL gerado para configuração RLS:');
  console.log('=' .repeat(80));
  console.log(sqlCommands.join('\n'));
  console.log('=' .repeat(80));

  console.log('\n⚠️  IMPORTANTE: Execute os comandos SQL acima no Supabase Dashboard');
  console.log('   1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql');
  console.log('   2. Cole e execute os comandos SQL acima');
  console.log('   3. Isso habilitará RLS e criará políticas básicas de segurança');

  console.log('\n✅ Script de configuração RLS concluído!');
}

setupRLSPolicies();