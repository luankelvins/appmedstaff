import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Corrigindo registros duplicados...\n');

const userId = 'b915cf4c-d2d9-4cd5-b37e-2cf0ff3147b5';

async function checkDuplicates() {
  try {
    console.log('🔍 Verificando registros duplicados...');
    
    // Verificar na tabela profiles
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (profilesError) {
      console.error('❌ Erro ao verificar profiles:', profilesError.message);
      return { profiles: [], employees: [] };
    }
    
    // Verificar na tabela employees
    const { data: employeesData, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', userId);
    
    if (employeesError) {
      console.error('❌ Erro ao verificar employees:', employeesError.message);
      return { profiles: profilesData || [], employees: [] };
    }
    
    console.log(`📊 Encontrados ${profilesData?.length || 0} registros em profiles`);
    console.log(`📊 Encontrados ${employeesData?.length || 0} registros em employees`);
    
    return { 
      profiles: profilesData || [], 
      employees: employeesData || [] 
    };
    
  } catch (err) {
    console.error('❌ Erro inesperado ao verificar duplicados:', err.message);
    return { profiles: [], employees: [] };
  }
}

async function cleanupEmployeesTable() {
  try {
    console.log('\n🧹 Limpando tabela employees...');
    
    // Remover o registro da tabela employees já que o usuário tem perfil completo em profiles
    const { error } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Erro ao remover da tabela employees:', error.message);
      return false;
    }
    
    console.log('✅ Registro removido da tabela employees');
    return true;
    
  } catch (err) {
    console.error('❌ Erro inesperado ao limpar employees:', err.message);
    return false;
  }
}

async function ensureSingleProfile() {
  try {
    console.log('\n📋 Verificando perfil único em profiles...');
    
    const { data: profilesData, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Erro ao verificar profiles:', error.message);
      return false;
    }
    
    if (!profilesData || profilesData.length === 0) {
      console.log('❌ Nenhum perfil encontrado em profiles');
      return false;
    }
    
    if (profilesData.length === 1) {
      console.log('✅ Perfil único encontrado em profiles');
      return true;
    }
    
    // Se há múltiplos perfis, manter o mais recente
    console.log(`⚠️ Encontrados ${profilesData.length} perfis. Mantendo o mais recente...`);
    
    const sortedProfiles = profilesData.sort((a, b) => 
      new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
    );
    
    const keepProfile = sortedProfiles[0];
    const removeProfiles = sortedProfiles.slice(1);
    
    console.log(`📌 Mantendo perfil criado em: ${keepProfile.created_at}`);
    console.log(`🗑️ Removendo ${removeProfiles.length} perfis antigos...`);
    
    for (const profile of removeProfiles) {
      const { error: deleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', profile.id)
        .eq('created_at', profile.created_at);
      
      if (deleteError) {
        console.error('❌ Erro ao remover perfil antigo:', deleteError.message);
      } else {
        console.log(`✅ Perfil antigo removido (${profile.created_at})`);
      }
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro inesperado ao garantir perfil único:', err.message);
    return false;
  }
}

async function testFinalAccess() {
  try {
    console.log('\n🧪 Testando acesso final...');
    
    // Teste com cliente admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (adminError) {
      console.error('❌ Erro com cliente admin:', adminError.message);
      return false;
    }
    
    console.log('✅ Cliente admin consegue acessar perfil único');
    console.log(`  - Nome: ${adminData.name}`);
    console.log(`  - Email: ${adminData.email}`);
    console.log(`  - Role: ${adminData.role}`);
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro inesperado no teste final:', err.message);
    return false;
  }
}

async function main() {
  console.log(`🎯 Corrigindo registros para usuário: ${userId}\n`);
  
  // 1. Verificar duplicados
  const { profiles, employees } = await checkDuplicates();
  
  // 2. Limpar tabela employees se necessário
  if (employees.length > 0) {
    await cleanupEmployeesTable();
  }
  
  // 3. Garantir perfil único em profiles
  if (profiles.length > 0) {
    await ensureSingleProfile();
  }
  
  // 4. Teste final
  const success = await testFinalAccess();
  
  if (success) {
    console.log('\n✅ Correção concluída com sucesso!');
    console.log('💡 O usuário agora deve conseguir fazer login normalmente.');
  } else {
    console.log('\n❌ Ainda há problemas. Verifique os logs acima.');
  }
}

main().catch(console.error);