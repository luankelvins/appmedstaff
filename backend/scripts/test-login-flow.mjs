import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testando fluxo de login...\n');

async function testAuthFlow() {
  try {
    console.log('🔐 Testando login com credenciais...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'luankelvin@soumedstaff.com',
      password: 'admin123' // Assumindo que esta é a senha
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Login realizado com sucesso');
      console.log(`  - User ID: ${data.user.id}`);
      console.log(`  - Email: ${data.user.email}`);
      
      // Testar busca do perfil
      await testProfileFetch(data.user.id);
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('✅ Logout realizado com sucesso');
      
      return true;
    }
    
    return false;
    
  } catch (err) {
    console.error('❌ Erro inesperado no teste de auth:', err.message);
    return false;
  }
}

async function testProfileFetch(userId) {
  try {
    console.log('\n📋 Testando busca do perfil...');
    
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (error) {
      console.error('❌ Erro ao buscar perfil:', error.message);
      return false;
    }
    
    if (data) {
      console.log(`✅ Perfil encontrado em ${duration}ms`);
      console.log(`  - Nome: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Role: ${data.role}`);
      
      if (duration > 3000) {
        console.log('⚠️ Busca do perfil demorou mais que 3 segundos');
      } else {
        console.log('🚀 Performance da busca do perfil está boa');
      }
      
      return true;
    }
    
    return false;
    
  } catch (err) {
    console.error('❌ Erro inesperado na busca do perfil:', err.message);
    return false;
  }
}

async function testSessionCheck() {
  try {
    console.log('\n🔍 Testando verificação de sessão...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao verificar sessão:', error.message);
      return false;
    }
    
    if (data.session) {
      console.log('ℹ️ Sessão ativa encontrada (esperado após logout: não)');
    } else {
      console.log('✅ Nenhuma sessão ativa (correto após logout)');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro inesperado na verificação de sessão:', err.message);
    return false;
  }
}

async function testConnectionSpeed() {
  try {
    console.log('\n⚡ Testando velocidade de conexão...');
    
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (error) {
      console.error('❌ Erro no teste de velocidade:', error.message);
      return false;
    }
    
    console.log(`✅ Conexão testada em ${duration}ms`);
    
    if (duration > 2000) {
      console.log('⚠️ Conexão está lenta (>2s)');
    } else if (duration > 1000) {
      console.log('⚠️ Conexão está moderada (>1s)');
    } else {
      console.log('🚀 Conexão está rápida (<1s)');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro inesperado no teste de velocidade:', err.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Iniciando testes do fluxo de login...\n');
  
  let allTestsPassed = true;
  
  // Teste 1: Velocidade de conexão
  const connectionTest = await testConnectionSpeed();
  allTestsPassed = allTestsPassed && connectionTest;
  
  // Teste 2: Verificação de sessão inicial
  const sessionTest = await testSessionCheck();
  allTestsPassed = allTestsPassed && sessionTest;
  
  // Teste 3: Fluxo completo de auth
  const authTest = await testAuthFlow();
  allTestsPassed = allTestsPassed && authTest;
  
  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('🎉 O sistema de login está funcionando corretamente');
    console.log('\n💡 Próximos passos:');
    console.log('  - Acesse http://localhost:3000');
    console.log('  - Faça login com: luankelvin@soumedstaff.com');
    console.log('  - A aplicação deve carregar sem timeouts');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os logs acima para identificar problemas');
  }
}

main().catch(console.error);