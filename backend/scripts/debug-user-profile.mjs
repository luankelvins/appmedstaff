import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Diagnosticando problema do usuário logado...\n');

const userId = 'b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5';

async function checkUserInAuth() {
  try {
    console.log('👤 Verificando usuário na auth.users...');
    
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('❌ Erro ao buscar usuário na auth:', error.message);
      return null;
    }
    
    if (data.user) {
      console.log('✅ Usuário encontrado na auth:');
      console.log(`  - ID: ${data.user.id}`);
      console.log(`  - Email: ${data.user.email}`);
      console.log(`  - Criado em: ${data.user.created_at}`);
      console.log(`  - Último login: ${data.user.last_sign_in_at}`);
      return data.user;
    } else {
      console.log('❌ Usuário não encontrado na auth');
      return null;
    }
  } catch (err) {
    console.error('❌ Erro inesperado ao verificar auth:', err.message);
    return null;
  }
}

async function checkUserInEmployees() {
  try {
    console.log('\n👥 Verificando usuário na tabela employees...');
    
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ Usuário não encontrado na tabela employees (normal)');
      } else {
        console.error('❌ Erro ao buscar na tabela employees:', error.message);
      }
      return null;
    }
    
    if (data) {
      console.log('✅ Usuário encontrado na tabela employees:');
      console.log(`  - Nome: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Posição: ${data.position}`);
      return data;
    }
    
    return null;
  } catch (err) {
    console.error('❌ Erro inesperado ao verificar employees:', err.message);
    return null;
  }
}

async function checkUserInProfiles() {
  try {
    console.log('\n📋 Verificando usuário na tabela profiles...');
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Usuário não encontrado na tabela profiles');
      } else {
        console.error('❌ Erro ao buscar na tabela profiles:', error.message);
      }
      return null;
    }
    
    if (data) {
      console.log('✅ Usuário encontrado na tabela profiles:');
      console.log(`  - Nome: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Posição: ${data.position}`);
      console.log(`  - Role: ${data.role}`);
      return data;
    }
    
    return null;
  } catch (err) {
    console.error('❌ Erro inesperado ao verificar profiles:', err.message);
    return null;
  }
}

async function createMissingProfile(authUser) {
  try {
    console.log('\n🔧 Criando perfil ausente...');
    
    const profileData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
      position: 'Usuário',
      department: 'Geral',
      employee_id: `USR${Date.now().toString().slice(-6)}`,
      role: 'user',
      permissions: ['read'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar perfil:', error.message);
      return null;
    }
    
    console.log('✅ Perfil criado com sucesso:');
    console.log(`  - Nome: ${data.name}`);
    console.log(`  - Email: ${data.email}`);
    console.log(`  - Role: ${data.role}`);
    
    return data;
  } catch (err) {
    console.error('❌ Erro inesperado ao criar perfil:', err.message);
    return null;
  }
}

async function testProfileAccess() {
  try {
    console.log('\n🧪 Testando acesso ao perfil com cliente anônimo...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Erro com cliente anônimo:', error.message);
      console.log('ℹ️ Isso pode indicar problema de RLS');
    } else {
      console.log('✅ Cliente anônimo consegue acessar o perfil');
    }
    
    console.log('\n🧪 Testando acesso ao perfil com cliente admin...');
    
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (adminError) {
      console.error('❌ Erro com cliente admin:', adminError.message);
    } else {
      console.log('✅ Cliente admin consegue acessar o perfil');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado no teste de acesso:', err.message);
  }
}

async function main() {
  console.log(`🎯 Diagnosticando usuário: ${userId}\n`);
  
  // 1. Verificar se o usuário existe na auth
  const authUser = await checkUserInAuth();
  
  if (!authUser) {
    console.log('\n❌ Usuário não existe na auth. Problema de autenticação.');
    return;
  }
  
  // 2. Verificar se existe na tabela employees
  const employeeData = await checkUserInEmployees();
  
  // 3. Verificar se existe na tabela profiles
  const profileData = await checkUserInProfiles();
  
  // 4. Se não existe em profiles, criar
  if (!profileData && !employeeData) {
    console.log('\n⚠️ Usuário não tem perfil em nenhuma tabela. Criando perfil...');
    await createMissingProfile(authUser);
  }
  
  // 5. Testar acesso
  await testProfileAccess();
  
  console.log('\n✅ Diagnóstico concluído!');
}

main().catch(console.error);