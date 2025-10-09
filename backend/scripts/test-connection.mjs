import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testando conexão com Supabase...\n');

// Verificar variáveis de ambiente
console.log('📋 Variáveis de ambiente:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
console.log('- ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');
console.log('- SERVICE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Não configurada');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

// Cliente com chave anônima
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com service role (se disponível)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function testConnection() {
  try {
    console.log('🔗 Testando conexão básica...');
    
    // Teste básico de conexão
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro na conexão básica:', error.message);
      return false;
    }
    
    console.log('✅ Conexão básica funcionando');
    console.log(`📊 Número de perfis: ${data || 0}`);
    
    return true;
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    return false;
  }
}

async function testTasksTable() {
  try {
    console.log('\n📋 Testando acesso à tabela tasks...');
    
    // Teste com cliente anônimo
    const { data: anonData, error: anonError } = await supabase
      .from('tasks')
      .select('count', { count: 'exact', head: true });
    
    if (anonError) {
      console.log('❌ Cliente anônimo não pode acessar tasks:', anonError.message);
    } else {
      console.log('✅ Cliente anônimo pode acessar tasks');
      console.log(`📊 Número de tasks: ${anonData || 0}`);
    }
    
    // Teste com service role (se disponível)
    if (supabaseAdmin) {
      console.log('\n🔑 Testando com service role...');
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('tasks')
        .select('count', { count: 'exact', head: true });
      
      if (adminError) {
        console.log('❌ Service role não pode acessar tasks:', adminError.message);
      } else {
        console.log('✅ Service role pode acessar tasks');
        console.log(`📊 Número de tasks: ${adminData || 0}`);
      }
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado ao testar tasks:', err.message);
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 Testando autenticação...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Erro ao verificar sessão:', error.message);
    } else if (session) {
      console.log('✅ Usuário autenticado:', session.user.email);
    } else {
      console.log('ℹ️ Nenhum usuário autenticado (esperado para teste de script)');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado ao testar auth:', err.message);
  }
}

async function testRLSPolicies() {
  try {
    console.log('\n🛡️ Testando políticas RLS...');
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'tasks');
      
      if (error) {
        console.log('❌ Erro ao verificar políticas RLS:', error.message);
      } else {
        console.log(`✅ Encontradas ${data.length} políticas RLS para tasks:`);
        data.forEach(policy => {
          console.log(`  - ${policy.policyname} (${policy.cmd})`);
        });
      }
    } else {
      console.log('ℹ️ Service role não disponível para testar RLS');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado ao testar RLS:', err.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testTasksTable();
    await testAuth();
    await testRLSPolicies();
  }
  
  console.log('\n🏁 Teste concluído!');
}

runAllTests().catch(console.error);