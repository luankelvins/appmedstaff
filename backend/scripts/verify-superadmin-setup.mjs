import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SUPERADMIN_EMAIL = 'Luankelvin@soumedstaff.com';

async function verifySuperadminSetup() {
  try {
    console.log('🔍 Verificando configuração completa do superadmin...\n');

    // 1. Verificar se as colunas existem
    console.log('1️⃣ Verificando colunas da tabela profiles...');
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('id, email, role, permissions, full_name')
      .limit(1)
      .single();

    if (testError && testError.message.includes('column')) {
      console.error('❌ As colunas role, permissions ou full_name ainda não existem.');
      console.log('📋 Execute o SQL em: database/add-superadmin-columns.sql');
      return false;
    }
    console.log('✅ Colunas verificadas com sucesso');

    // 2. Verificar perfil do superadmin
    console.log('\n2️⃣ Verificando perfil do superadmin...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', SUPERADMIN_EMAIL)
      .single();

    if (profileError || !profile) {
      console.error('❌ Perfil do superadmin não encontrado');
      return false;
    }

    console.log('✅ Perfil encontrado:');
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Nome: ${profile.name}`);
    console.log(`   - Nome completo: ${profile.full_name || 'Não definido'}`);
    console.log(`   - Cargo: ${profile.role || 'Não definido'}`);
    console.log(`   - Permissões: ${profile.permissions ? profile.permissions.length : 0} permissões`);

    // 3. Verificar funcionário vinculado
    console.log('\n3️⃣ Verificando funcionário vinculado...');
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', SUPERADMIN_EMAIL)
      .single();

    if (employee) {
      console.log('✅ Funcionário encontrado:');
      console.log(`   - ID: ${employee.id}`);
      console.log(`   - Email: ${employee.email}`);
      console.log(`   - Status: ${employee.status}`);
      
      // Verificar vinculação
      if (profile.employee_id === employee.id) {
        console.log('✅ Perfil está corretamente vinculado ao funcionário');
      } else {
        console.log('⚠️ Perfil não está vinculado ao funcionário');
        console.log(`   - Profile employee_id: ${profile.employee_id}`);
        console.log(`   - Employee ID: ${employee.id}`);
      }
    } else {
      console.log('⚠️ Funcionário não encontrado');
    }

    // 4. Verificar permissões específicas
    console.log('\n4️⃣ Verificando permissões de superadmin...');
    if (profile.role === 'super_admin') {
      console.log('✅ Role de superadmin configurado');
    } else {
      console.log(`⚠️ Role atual: ${profile.role} (esperado: super_admin)`);
    }

    if (profile.permissions && Array.isArray(profile.permissions)) {
      console.log(`✅ Permissões configuradas: ${profile.permissions.length} permissões`);
      console.log('   Permissões:', profile.permissions.join(', '));
    } else {
      console.log('⚠️ Permissões não configuradas ou inválidas');
    }

    // 5. Verificar usuário de autenticação
    console.log('\n5️⃣ Verificando usuário de autenticação...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao verificar usuários de autenticação:', authError.message);
    } else {
      const authUser = authUsers.users.find(u => u.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());
      if (authUser) {
        console.log('✅ Usuário de autenticação encontrado:');
        console.log(`   - ID: ${authUser.id}`);
        console.log(`   - Email: ${authUser.email}`);
        console.log(`   - Confirmado: ${authUser.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`   - Criado em: ${new Date(authUser.created_at).toLocaleString()}`);
      } else {
        console.log('⚠️ Usuário de autenticação não encontrado');
      }
    }

    // 6. Resumo final
    console.log('\n📊 RESUMO DA CONFIGURAÇÃO:');
    console.log('================================');
    
    const isComplete = profile.role === 'super_admin' && 
                      profile.permissions && 
                      profile.permissions.length > 0 &&
                      employee;

    if (isComplete) {
      console.log('🎉 CONFIGURAÇÃO COMPLETA!');
      console.log('✅ Todas as verificações passaram');
      console.log('✅ O superadmin está pronto para uso');
      console.log('\n📋 Próximos passos:');
      console.log('   1. Teste o login no sistema');
      console.log('   2. Verifique o acesso às funcionalidades administrativas');
      console.log('   3. Confirme que as permissões estão funcionando');
    } else {
      console.log('⚠️ CONFIGURAÇÃO INCOMPLETA');
      console.log('❌ Algumas verificações falharam');
      console.log('\n📋 Ações necessárias:');
      if (profile.role !== 'super_admin') {
        console.log('   - Execute: node scripts/apply-superadmin-permissions.mjs');
      }
      if (!employee) {
        console.log('   - Verifique a criação do funcionário');
      }
    }

    return isComplete;

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

verifySuperadminSetup();